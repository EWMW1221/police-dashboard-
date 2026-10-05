import json
import secrets
from collections import Counter
from datetime import datetime
from functools import wraps
from pathlib import Path

from django.contrib.auth.hashers import check_password, make_password
from django.db import connection, transaction
from django.db.models import Count, Q
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from django.conf import settings

from .models import AdditionalInformationRequest, CrimeReport, Officer, ReportAttachment, ReportStatusHistory, ReportSubmission


REPORT_METADATA_FIELDS = {
    'test', 'language', 'report_type', 'status', 'description', 'incident_type',
    'subcity', 'kebele', 'incident_subcity', 'incident_kebele',
    'incident_date', 'incident_time', 'full_name', 'email', 'phone', 'sex',
    'age', 'anonymous_email',
}
PERSONAL_FORM_FIELDS = {
    'full_name', 'fullName', 'fullNameEn', 'fullNameAm',
    'email', 'emailEn', 'emailAm', 'phone', 'phoneEn', 'phoneAm',
    'sex', 'sexEn', 'sexAm', 'age', 'ageEn', 'ageAm',
    'anonymous_email', 'anonymousEmail', 'anonymousEmailEn', 'anonymousEmailAm',
}
INVALID_FORM_ANSWER = 'all the questions are answered, selected and checked'
INVALID_SAVED_ANSWER = 'the report could not be saved. please start the django backend and try again.'


def _normalize_status(status):
    if status is None:
        return 'new'

    normalized = str(status).strip().lower()
    if normalized in {'under investigation', 'under_investigation', 'in progress', 'in_progress', 'pending', 'investigation'}:
        return 'under investigation'
    if normalized == 'resolved':
        return 'resolved'
    return 'new'


def _dashboard_user(request):
    return request.session.get('dashboard_user')


def _dashboard_required(request):
    if _dashboard_user(request):
        return None
    return JsonResponse({'error': 'Dashboard authentication is required.'}, status=401)


def _dashboard_role_required(request, role):
    user = _dashboard_user(request)
    if not user:
        return JsonResponse({'error': 'Dashboard authentication is required.'}, status=401)
    if user.get('role') != role:
        return JsonResponse({'error': 'This dashboard action is not available for your role.'}, status=403)
    return None


def _report_scope_error(request, report_id):
    user = _dashboard_user(request) or {}
    if user.get('role') != 'police':
        return None
    report = CrimeReport.objects.filter(id=report_id).first()
    submission = ReportSubmission.objects.filter(report_id=report_id).order_by('-updated_at', '-created_at').first()
    if not report or _subcity_key(_report_subcity(report, submission)) != _subcity_key(user.get('subcity')):
        return JsonResponse({'error': 'This report is outside your assigned sub-city.'}, status=403)
    return None


def _citizen_report_data(report, submission=None):
    report_data = _report_data(report, submission)
    return {
        'id': report_data['id'],
        'trackingNumber': report_data['trackingNumber'],
        'tracking_number_en': report_data['tracking_number_en'],
        'tracking_number_am': report_data['tracking_number_am'],
        'status': report_data['status'],
        'report_type': report_data['report_type'],
        'incidentType': report_data['incidentType'],
        'incident_type': report_data['incident_type'],
        'subcity': report_data['subcity'],
        'kebele': report_data['kebele'],
        'created_at': report_data['created_at'],
        'createdAt': report_data['createdAt'],
        'generalInformation': report_data['generalInformation'],
        'resolvedInvestigationProgress': report_data['resolvedInvestigationProgress'],
        'underInvestigationProgress': report_data['underInvestigationProgress'],
        'additionalInformationRequests': report_data['additionalInformationRequests'],
    }


def _require_dashboard_for_mutation(request):
    if request.method in {'POST', 'PATCH', 'PUT', 'DELETE'}:
        return _dashboard_required(request)
    return None


def _progress_key(status):
    normalized_status = _normalize_status(status)
    if normalized_status == 'resolved':
        return 'investigation_progress_resolved'
    if normalized_status == 'under investigation':
        return 'investigation_progress_under_investigation'
    return None


def _progress_values(details, status):
    details = details or {}
    legacy_value = details.get('general_information', '')
    normalized_status = _normalize_status(status)
    return {
        'resolved': details.get('investigation_progress_resolved', '') or (
            legacy_value if normalized_status == 'resolved' else ''
        ),
        'underInvestigation': details.get('investigation_progress_under_investigation', '') or (
            legacy_value if normalized_status == 'under investigation' else ''
        ),
    }


def _submission_value(submission, *field_names):
    if not submission:
        return ''

    sources = (
        submission.incident_information,
        submission.supporting_information,
        submission.raw_form_data,
        submission.personal_information,
    )
    for source in sources:
        if not isinstance(source, dict):
            continue
        for field_name in field_names:
            value = source.get(field_name)
            if value not in ('', None):
                return value
    return ''


def _subcity_key(value):
    subcity_pairs = {
        'ታቦር': 'tabor',
        'አዲስ ከተማ': 'addisketema',
        'ሃይቅ ዳር': 'hayekdar',
        'መሃል': 'mehal',
        'ባህል አዳራሽ': 'bahiladarash',
        'ምስራቅ': 'misrak',
        'መናሃሪያ': 'menahariya',
        'ቱላ (ሐዌላ-ቱላ)': 'tullahawelatula',
    }
    value_text = str(value or '').strip().casefold()
    if value_text in subcity_pairs:
        return subcity_pairs[value_text]
    normalized = ''.join(character for character in value_text if character.isalnum())
    aliases = {
        'haykdar': 'hayekdar',
        'tula': 'tullahawelatula',
        'tulla': 'tullahawelatula',
        'tullahawelatula': 'tullahawelatula',
    }
    return aliases.get(normalized, normalized)


def _report_subcity(report, submission=None):
    return (
        _submission_value(submission, 'incident_subcity', 'subcity', 'subcityEn', 'subcityAm')
        or report.subcity
        or report.reporter_details.get('subcity')
        or report.supporting_details.get('incident_subcity')
        or report.raw_payload.get('subcity')
        or ''
    )


def _is_displayable_answer(value):
    if value in ('', None):
        return False
    if isinstance(value, str):
        normalized = value.strip().lower()
        return normalized not in (INVALID_FORM_ANSWER, INVALID_FORM_ANSWER * 2, INVALID_SAVED_ANSWER)
    return True


def _clean_source(value):
    if isinstance(value, dict):
        return {
            key: cleaned_value
            for key, nested_value in value.items()
            if _is_displayable_answer(cleaned_value := _clean_source(nested_value))
        }
    if isinstance(value, list):
        return [_clean_source(item) for item in value if _is_displayable_answer(item)]
    return value


def _subcity_filter(request):
    subcity = request.GET.get('subcity', '').strip()
    if not subcity:
        return Q()

    return (
        Q(subcity__iexact=subcity)
        | Q(reporter_details__subcity__iexact=subcity)
        | Q(supporting_details__incident_subcity__iexact=subcity)
        | Q(raw_payload__subcity__iexact=subcity)
    )


def _submission_report_ids_for_subcity(subcity):
    if not subcity:
        return []

    matching_ids = []
    for submission in ReportSubmission.objects.all().iterator():
        submission_subcity = str(_submission_value(
            submission,
            'incident_subcity', 'subcity', 'subcityEn', 'subcityAm',
        )).strip()
        if _subcity_key(submission_subcity) == _subcity_key(subcity):
            matching_ids.append(submission.report_id)
    return matching_ids


def _submission_report_rows(subcity=''):
    submissions = list(ReportSubmission.objects.all().order_by('-created_at'))
    if not subcity:
        return submissions

    normalized_subcity = _subcity_key(subcity)
    return [
        submission for submission in submissions
        if _subcity_key(_submission_value(
            submission,
            'incident_subcity', 'subcity', 'subcityEn', 'subcityAm',
        )) == normalized_subcity
    ]


def _database_report_data(subcity=''):
    reports = CrimeReport.objects.all().order_by('-created_at')
    report_data = []
    normalized_subcity = _subcity_key(subcity)
    for report in reports:
        submission = ReportSubmission.objects.filter(report_id=report.id).order_by('-created_at').first()
        data = _report_data(report, submission)
        if subcity and _subcity_key(data.get('subcity')) != normalized_subcity:
            continue
        report_data.append(data)
    return report_data


def _report_data(report, submission=None):
    source = report.source_am if report.language == 'am' else report.source_en
    source_personal_information = (source or {}).get('personal_information') or {}
    source_incident_form = (source or {}).get('incident_form') or {}
    details = {
        **report.incident_details,
        **report.raw_payload,
        **report.supporting_details,
        **source_incident_form,
    }
    if submission:
        details = {
            **submission.incident_information,
            **submission.supporting_information,
            **submission.raw_form_data,
        }
    incident_form_details = {
        key: value for key, value in details.items()
        if key not in REPORT_METADATA_FIELDS
    }
    reporter_details = {
        'full_name': report.full_name,
        'email': report.email,
        'phone': report.phone,
        'sex': report.sex,
        'age': report.age,
        'anonymous_email': report.anonymous_email,
        **(report.reporter_details or {}),
    }
    if submission:
        reporter_details = {**reporter_details, **submission.personal_information}
    for field_name in PERSONAL_FORM_FIELDS:
        if field_name in details and _is_displayable_answer(details[field_name]):
            reporter_details[field_name] = details[field_name]
    question_answers = submission.question_answers if submission else (
        report.raw_payload.get('question_answers') or report.supporting_details.get('question_answers') or []
    )
    yes_no_answers = submission.yes_no_answers if submission else (
        report.raw_payload.get('yes_no_answer')
        or report.raw_payload.get('yes_no_answers')
        or report.supporting_details.get('yes_no_answer')
        or report.supporting_details.get('yes_no_answers')
        or []
    )
    if submission:
        question_answers = [*question_answers, *yes_no_answers]
    persisted_status = _normalize_status(
        (submission.supporting_information or {}).get('status', report.status)
        if submission else report.status
    )
    persisted_progress = _progress_values(
        {
            **(submission.supporting_information if submission else {}),
            **(report.supporting_details or {}),
        },
        persisted_status,
    )
    return {
        'id': report.id,
        'language': report.language,
        'report_type': report.report_type,
        'incidentType': report.incident_type or report.report_type,
        'subcity': _report_subcity(report, submission),
        'kebele': report.kebele or _submission_value(submission, 'incident_kebele', 'kebele', 'kebeleEn', 'kebeleAm') or details.get('incident_kebele', ''),
        'date': details.get('incident_date', ''),
        'time': details.get('incident_time', ''),
        'status': persisted_status,
        'description': report.description or '',
        'reporterDetails': {**reporter_details, **source_personal_information},
        'incidentFormDetails': incident_form_details,
        'supporting_information': submission.supporting_information if submission else report.supporting_details,
        'source': _clean_source(source or {}),
        'trackingNumber': report.tracking_number,
        'createdAt': report.created_at,
        'questionAnswers': question_answers,
        'yes_no_answer': yes_no_answers,
        'incident_type': report.incident_type or report.report_type,
        'tracking_number_en': report.tracking_number,
        'tracking_number_am': report.tracking_number,
        'created_at': report.created_at,
        'question_answers': question_answers,
        'evidence': submission.evidence if submission else report.evidence,
        'generalInformation': persisted_progress[
            'resolved' if persisted_status == 'resolved' else 'underInvestigation'
        ],
        'resolvedInvestigationProgress': persisted_progress['resolved'],
        'underInvestigationProgress': persisted_progress['underInvestigation'],
        'submissionId': submission.id if submission else None,
        'attachments': _attachment_payloads_for_report(report.id),
        'statusHistory': _status_history_payload(report.id),
        'additionalInformationRequests': _additional_information_payload(report.id),
    }


def _attachment_payloads_for_report(report_id):
    attachments = ReportAttachment.objects.filter(report_id=report_id).order_by('created_at')
    payload = []
    for attachment in attachments:
        file_name = str(attachment.file or '').strip().lstrip('/')
        file_url = default_storage.url(file_name) if file_name else ''
        payload.append({
            'id': attachment.id,
            'report_id': attachment.report_id,
            'file': attachment.file,
            'original_name': attachment.original_name,
            'name': attachment.original_name,
            'content_type': attachment.content_type,
            'size': attachment.size,
            'field_name': attachment.field_name,
            'language': attachment.language,
            'created_at': attachment.created_at,
            'url': file_url,
        })
    return payload

def _additional_information_payload(report_id):
    requests = AdditionalInformationRequest.objects.filter(report_id=report_id).order_by('created_at')
    return [{
        'id': item.id,
        'requestMessage': item.request_message,
        'citizenResponse': item.citizen_response,
        'responseEvidence': item.response_evidence or [],
        'respondedAt': item.responded_at,
        'requestedBy': item.requested_by,
        'reviewedAt': item.reviewed_at,
        'reviewedBy': item.reviewed_by,
        'createdAt': item.created_at,
        'updatedAt': item.updated_at,
        'status': 'responded' if item.responded_at else 'requested',
        'unread': bool(item.responded_at and not item.reviewed_at),
    } for item in requests]


def _status_history_payload(report_id):
    return [{
        'id': item.id,
        'status': _normalize_status(item.status),
        'message': item.message,
        'createdAt': item.created_at,
    } for item in ReportStatusHistory.objects.filter(report_id=report_id)]


def _record_status_history(report_id, status, message):
    ReportStatusHistory.objects.create(
        report_id=report_id,
        status=_normalize_status(status),
        message=message,
        created_at=timezone.now(),
    )


def _additional_information_item_payload(item):
    return {
        'id': item.id,
        'requestMessage': item.request_message,
        'citizenResponse': item.citizen_response,
        'responseEvidence': item.response_evidence or [],
        'respondedAt': item.responded_at,
        'requestedBy': item.requested_by,
        'reviewedAt': item.reviewed_at,
        'reviewedBy': item.reviewed_by,
        'createdAt': item.created_at,
        'updatedAt': item.updated_at,
        'status': 'responded' if item.responded_at else 'requested',
        'unread': bool(item.responded_at and not item.reviewed_at),
    }


def _citizen_tracking_error(request, report_id):
    if _dashboard_user(request):
        return None
    supplied_tracking_number = str(
        request.GET.get('tracking_number')
        or request.POST.get('tracking_number')
        or '',
    ).strip()
    if not supplied_tracking_number or not CrimeReport.objects.filter(
        id=report_id,
    ).filter(
        Q(tracking_number_en__iexact=supplied_tracking_number)
        | Q(tracking_number_am__iexact=supplied_tracking_number),
    ).exists():
        return JsonResponse({'error': 'A valid tracking number is required.'}, status=403)
    return None


def _save_additional_evidence(uploaded_file, report_id, request_id):
    file_name = Path(uploaded_file.name).name
    storage_path = f'additional-information/{report_id}/{request_id}/{file_name}'
    saved_path = default_storage.save(storage_path, ContentFile(uploaded_file.read()))
    return {
        'name': file_name,
        'path': saved_path,
        'url': default_storage.url(saved_path),
        'contentType': uploaded_file.content_type or '',
        'size': uploaded_file.size,
    }


def _save_report_evidence(uploaded_file, report_id):
    file_name = Path(uploaded_file.name).name
    storage_path = f'reports/{report_id}/{file_name}'
    saved_path = default_storage.save(storage_path, ContentFile(uploaded_file.read()))
    return {
        'name': file_name,
        'path': saved_path,
        'url': default_storage.url(saved_path),
        'contentType': uploaded_file.content_type or '',
        'size': uploaded_file.size,
    }


def _validate_uploaded_evidence(uploaded_files):
    allowed_types = {
        'image/jpeg', 'image/png', 'image/gif',
        'audio/mpeg', 'audio/wav',
        'video/mp4', 'video/webm',
        'application/pdf',
    }
    for uploaded_file in uploaded_files:
        if uploaded_file.size > 5 * 1024 * 1024:
            return 'Each evidence file must be 5 MB or smaller.'
        if uploaded_file.content_type not in allowed_types:
            return 'Evidence must be an image, audio, video, or PDF file.'
    return ''


def _new_tracking_number():
    existing_numbers = set(CrimeReport.objects.values_list('tracking_number_en', flat=True))
    existing_numbers.update(CrimeReport.objects.values_list('tracking_number_am', flat=True))
    while True:
        tracking_number = f'{secrets.randbelow(100000):05d}'
        if tracking_number not in existing_numbers:
            return tracking_number


def _submission_report_data(submission):
    incident_information = submission.incident_information or {}
    supporting_information = submission.supporting_information or {}
    raw_form_data = submission.raw_form_data or {}
    personal_information = submission.personal_information or {}
    details = {
        **incident_information,
        **supporting_information,
        **raw_form_data,
    }
    report_type = incident_information.get('report_type') or details.get('report_type') or 'General report'
    incident_type = incident_information.get('incident_type') or details.get('incident_type') or report_type
    subcity = _submission_value(submission, 'incident_subcity', 'subcity', 'subcityEn', 'subcityAm')
    kebele = _submission_value(submission, 'incident_kebele', 'kebele', 'kebeleEn', 'kebeleAm')
    yes_no_answers = submission.yes_no_answers or []
    question_answers = [*(submission.question_answers or []), *yes_no_answers]
    attachment_payload = _attachment_payloads_for_report(submission.report_id)
    linked_report = CrimeReport.objects.filter(id=submission.report_id).first()
    tracking_number = linked_report.tracking_number if linked_report else None
    return {
        'id': submission.report_id,
        'language': incident_information.get('language') or 'en',
        'report_type': report_type,
        'incidentType': incident_type,
        'subcity': subcity,
        'kebele': kebele,
        'date': details.get('incident_date', ''),
        'time': details.get('incident_time', ''),
        'status': details.get('status') or 'new',
        'description': details.get('description', ''),
        'reporterDetails': personal_information,
        'incidentFormDetails': {
            key: value for key, value in details.items()
            if key not in REPORT_METADATA_FIELDS
        },
        'supporting_information': supporting_information,
        'source': {},
        'trackingNumber': tracking_number,
        'createdAt': submission.created_at,
        'questionAnswers': question_answers,
        'yes_no_answer': yes_no_answers,
        'incident_type': incident_type,
        'tracking_number_en': tracking_number,
        'tracking_number_am': tracking_number,
        'created_at': submission.created_at,
        'question_answers': question_answers,
        'evidence': submission.evidence or [],
        'attachments': attachment_payload,
        'generalInformation': _progress_values(supporting_information, details.get('status'))[
            'resolved' if _normalize_status(details.get('status')) == 'resolved' else 'underInvestigation'
        ],
        'resolvedInvestigationProgress': _progress_values(supporting_information, details.get('status'))['resolved'],
        'underInvestigationProgress': _progress_values(supporting_information, details.get('status'))['underInvestigation'],
        'submissionId': submission.id,
        'additionalInformationRequests': _additional_information_payload(submission.report_id),
    }


def dashboard_stats(request):
    authentication_error = _dashboard_required(request)
    if authentication_error:
        return authentication_error
    subcity = request.GET.get('subcity', '').strip()
    dashboard_user = _dashboard_user(request) or {}
    if dashboard_user.get('role') == 'police':
        subcity = dashboard_user.get('subcity') or subcity
    report_list = _database_report_data(subcity)
    report_list.sort(key=lambda report: report.get('created_at') or '', reverse=True)

    by_type = {}
    by_area = {}
    for report in report_list:
        report_type = report.get('report_type') or ''
        kebele = report.get('kebele') or ''
        by_type[report_type] = by_type.get(report_type, 0) + 1
        if kebele:
            by_area[kebele] = by_area.get(kebele, 0) + 1
    under_investigation = sum(1 for report in report_list if _normalize_status(report.get('status')) == 'under investigation')

    return JsonResponse({
        'subcity': subcity,
        'total': len(report_list),
        'pending': under_investigation,
        'underInvestigation': under_investigation,
        'resolved': sum(1 for report in report_list if _normalize_status(report.get('status')) == 'resolved'),
        'byType': [{'name': name, 'count': count} for name, count in by_type.items()],
        'byArea': [{'name': name, 'count': count} for name, count in by_area.items()],
        'reports': report_list,
    })


@csrf_exempt
@require_http_methods(['GET', 'POST', 'PATCH'])
def additional_information(request, report_id):
    if not CrimeReport.objects.filter(id=report_id).exists() and not ReportSubmission.objects.filter(report_id=report_id).exists():
        return JsonResponse({'error': 'Report not found.'}, status=404)

    citizen_tracking_error = _citizen_tracking_error(request, report_id)
    if citizen_tracking_error:
        return citizen_tracking_error

    if request.method == 'GET':
        return JsonResponse({'requests': _additional_information_payload(report_id)})

    if request.content_type and request.content_type.startswith('multipart/form-data'):
        request_id = str(request.POST.get('request_id', '')).strip()
        response_text = str(request.POST.get('response', request.POST.get('citizen_response', ''))).strip()
        if not request_id or not response_text:
            return JsonResponse({'error': 'A request ID and response are required.'}, status=400)
        try:
            request_pk = int(request_id)
        except ValueError:
            return JsonResponse({'error': 'Additional information request not found.'}, status=404)
        if len(response_text) > 5000:
            return JsonResponse({'error': 'Response must be 5,000 characters or fewer.'}, status=400)

        with transaction.atomic():
            try:
                information_request = AdditionalInformationRequest.objects.select_for_update().get(
                    id=request_pk,
                    report_id=report_id,
                )
            except AdditionalInformationRequest.DoesNotExist:
                return JsonResponse({'error': 'Additional information request not found.'}, status=404)
            if information_request.responded_at:
                return JsonResponse({'error': 'This additional information request has already been answered.'}, status=409)

            evidence = list(information_request.response_evidence or [])
            for uploaded_file in request.FILES.getlist('evidence'):
                if uploaded_file.size > 5 * 1024 * 1024:
                    return JsonResponse({'error': 'Each evidence file must be 5 MB or smaller.'}, status=400)
                if uploaded_file.content_type not in {'image/jpeg', 'image/png', 'image/gif', 'audio/mpeg', 'audio/wav', 'video/mp4', 'video/webm', 'application/pdf'}:
                    return JsonResponse({'error': 'Evidence must be an image, audio, video, or PDF file.'}, status=400)
                evidence.append(_save_additional_evidence(uploaded_file, report_id, information_request.id))

            information_request.citizen_response = response_text
            information_request.response_evidence = evidence
            information_request.responded_at = timezone.now()
            information_request.save(update_fields=['citizen_response', 'response_evidence', 'responded_at', 'updated_at'])
        return JsonResponse({'request': _additional_information_item_payload(information_request)})

    authentication_error = _dashboard_required(request)
    if authentication_error:
        return authentication_error
    scope_error = _report_scope_error(request, report_id)
    if scope_error:
        return scope_error

    if request.method == 'PATCH':
        try:
            payload = json.loads(request.body or '{}')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Request body must be valid JSON.'}, status=400)
        try:
            request_pk = int(payload.get('request_id'))
        except (TypeError, ValueError):
            return JsonResponse({'error': 'A valid additional information request ID is required.'}, status=400)
        action = str(payload.get('action') or '').strip().lower()
        if action not in {'reviewed', 'continue_investigation'}:
            return JsonResponse({'error': 'Unsupported additional information action.'}, status=400)
        information_request = AdditionalInformationRequest.objects.filter(
            id=request_pk,
            report_id=report_id,
            responded_at__isnull=False,
        ).first()
        if not information_request:
            return JsonResponse({'error': 'A responded additional information request was not found.'}, status=404)

        dashboard_user = _dashboard_user(request) or {}
        now = timezone.now()
        information_request.reviewed_at = information_request.reviewed_at or now
        information_request.reviewed_by = information_request.reviewed_by or dashboard_user.get('name', '')
        information_request.save(update_fields=['reviewed_at', 'reviewed_by', 'updated_at'])

        if action == 'continue_investigation':
            report = CrimeReport.objects.filter(id=report_id).first()
            submission = ReportSubmission.objects.filter(report_id=report_id).order_by('-updated_at').first()
            if report:
                previous_status = _normalize_status(report.status)
                report.status = 'under investigation'
                report.save(update_fields=['status', 'updated_at'])
                if report.status != previous_status:
                    _record_status_history(report.id, report.status, 'Investigation continued after additional information review.')
            if submission:
                supporting_information = dict(submission.supporting_information or {})
                supporting_information['status'] = 'under investigation'
                submission.supporting_information = supporting_information
                submission.save(update_fields=['supporting_information', 'updated_at'])

        return JsonResponse({
            'request': _additional_information_item_payload(information_request),
            'reportStatus': 'under investigation' if action == 'continue_investigation' else None,
        })

    try:
        payload = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Request body must be valid JSON.'}, status=400)
    request_message = str(payload.get('message', payload.get('request_message', ''))).strip()
    if not request_message:
        return JsonResponse({'error': 'A request message is required.'}, status=400)
    if len(request_message) > 5000:
        return JsonResponse({'error': 'Request message must be 5,000 characters or fewer.'}, status=400)
    with transaction.atomic():
        with connection.cursor() as cursor:
            cursor.execute('SELECT pg_advisory_xact_lock(%s)', [report_id])
        pending_request = AdditionalInformationRequest.objects.filter(
            report_id=report_id,
            responded_at__isnull=True,
        ).order_by('-created_at').first()
        if pending_request:
            return JsonResponse({
                'error': 'This report already has an unanswered additional information request.',
                'request': _additional_information_item_payload(pending_request),
            }, status=409)
        information_request = AdditionalInformationRequest.objects.create(
            report_id=report_id,
            request_message=request_message,
            requested_by=(_dashboard_user(request) or {}).get('name', ''),
        )
    return JsonResponse({'request': _additional_information_item_payload(information_request)}, status=201)


def _analytics_report_date(report):
    incident_date = str(report.get('date') or '').strip()
    if incident_date:
        for date_format in ('%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y'):
            try:
                return datetime.strptime(incident_date[:10], date_format).date()
            except ValueError:
                continue
    created_at = report.get('created_at')
    return created_at.date() if hasattr(created_at, 'date') else None


@require_http_methods(['GET'])
def crime_analytics(request):
    authentication_error = _dashboard_required(request)
    if authentication_error:
        return authentication_error

    dashboard_user = _dashboard_user(request) or {}
    requested_subcity = request.GET.get('subcity', '').strip()
    subcity = dashboard_user.get('subcity', '').strip() if dashboard_user.get('role') == 'police' else requested_subcity
    kebele = request.GET.get('kebele', '').strip()
    crime_type = request.GET.get('crime_type', '').strip()
    selected_year = request.GET.get('year', '').strip()

    scoped_reports = _database_report_data(subcity)
    reports = scoped_reports

    available_years = {report['created_at'].year for report in scoped_reports if report.get('created_at')}
    current_year = timezone.now().year
    historical_years = set(range(current_year - 10, current_year + 1))
    years = sorted(historical_years | available_years, reverse=True)
    try:
        year = int(selected_year) if selected_year else (years[0] if years else timezone.now().year)
    except ValueError:
        year = years[0] if years else timezone.now().year

    def report_year(report):
        created_at = report.get('created_at')
        return created_at.year if created_at else None

    def matches(report):
        if kebele and _subcity_key(report.get('kebele')) != _subcity_key(kebele):
            return False
        if crime_type and str(report.get('incidentType') or report.get('report_type') or '').casefold() != crime_type.casefold():
            return False
        return report_year(report) == year

    selected_reports = [report for report in reports if matches(report)]

    def aggregate(field):
        empty_label = 'Location not recorded' if field in {'subcity', 'kebele'} else 'Crime type not recorded'
        counts = Counter(report.get(field) or empty_label for report in selected_reports)
        return [{'name': name, 'count': count} for name, count in counts.most_common()]

    def option_values(field):
        return sorted({report.get(field) for report in selected_reports if report.get(field)})

    trend_counts = Counter(report_year(report) for report in reports if report_year(report))
    scope_year_counts = Counter(report_year(report) for report in scoped_reports if report_year(report))
    report_rows = [{
        'id': report['id'],
        'tracking_number_en': report['tracking_number_en'],
        'tracking_number_am': report['tracking_number_am'],
        'report_type': report['report_type'],
        'incident_type': report['incident_type'],
        'subcity': report['subcity'],
        'kebele': report['kebele'],
        'status': report['status'],
        'created_at': report['created_at'],
    } for report in selected_reports]
    report_rows.sort(key=lambda report: report.get('created_at') or timezone.make_aware(datetime.min), reverse=True)
    crime_types = sorted({report.get('incidentType') or report.get('report_type') for report in selected_reports if report.get('incidentType') or report.get('report_type')})

    return JsonResponse({
        'year': year,
        'years': years,
        'total': len(selected_reports),
        'totalAllYears': len(scoped_reports),
        'byYear': [
            {'year': report_year, 'count': trend_counts[report_year]}
            for report_year in sorted(trend_counts)
        ],
        'yearTotals': [
            {'year': report_year, 'count': scope_year_counts[report_year]}
            for report_year in sorted(scope_year_counts)
        ],
        'byType': aggregate('incident_type'),
        'bySubcity': aggregate('subcity'),
        'byKebele': aggregate('kebele'),
        'subcities': option_values('subcity'),
        'kebeles': option_values('kebele'),
        'crimeTypes': crime_types,
        'reports': report_rows,
    })


@csrf_exempt
@require_http_methods(['PATCH', 'PUT'])
def update_report_status(request, report_id):
    authentication_error = _dashboard_required(request)
    if authentication_error:
        return authentication_error
    scope_error = _report_scope_error(request, report_id)
    if scope_error:
        return scope_error
    submission = ReportSubmission.objects.filter(report_id=report_id).order_by('-updated_at').first()
    if submission:
        try:
            payload = json.loads(request.body or '{}')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Request body must be valid JSON.'}, status=400)

        supporting_information = dict(submission.supporting_information or {})
        if 'status' in payload:
            supporting_information['status'] = _normalize_status(payload.get('status'))
        progress_value = payload.get('investigation_progress', payload.get('general_information'))
        progress_key = _progress_key(payload.get('status', supporting_information.get('status')))
        if progress_value is not None and progress_key:
            supporting_information[progress_key] = str(progress_value or '').strip()

        submission.supporting_information = supporting_information
        submission.save(update_fields=['supporting_information', 'updated_at'])

        report = CrimeReport.objects.filter(id=report_id).first()
        if report:
            previous_status = _normalize_status(report.status)
            report.status = _normalize_status(supporting_information.get('status', report.status))
            report.supporting_details = {**(report.supporting_details or {}), **supporting_information}
            report.save(update_fields=['status', 'supporting_details', 'updated_at'])
            if report.status != previous_status:
                _record_status_history(report.id, report.status, f'Status changed to {report.status}.')

        progress = _progress_values(supporting_information, supporting_information.get('status'))
        return JsonResponse({
            'id': report_id,
            'status': supporting_information.get('status', 'new'),
            'generalInformation': progress['resolved' if _normalize_status(supporting_information.get('status')) == 'resolved' else 'underInvestigation'],
            'resolvedInvestigationProgress': progress['resolved'],
            'underInvestigationProgress': progress['underInvestigation'],
        })

    try:
        payload = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Request body must be valid JSON.'}, status=400)

    try:
        report = CrimeReport.objects.get(id=report_id)
    except CrimeReport.DoesNotExist:
        return JsonResponse({'error': 'Report not found.'}, status=404)

    supporting_information = dict(report.supporting_details or {})
    if 'status' in payload:
        supporting_information['status'] = _normalize_status(payload.get('status'))
    progress_value = payload.get('investigation_progress', payload.get('general_information'))
    progress_key = _progress_key(payload.get('status', supporting_information.get('status', report.status)))
    if progress_value is not None and progress_key:
        supporting_information[progress_key] = str(progress_value or '').strip()

    submission = ReportSubmission.objects.create(
        report_id=report.id,
        reporting_mode='dashboard',
        personal_information=report.reporter_details or {},
        incident_information=report.incident_details or {},
        supporting_information=supporting_information,
        raw_form_data=report.raw_payload or {},
        evidence=report.evidence or [],
        created_at=report.created_at or timezone.now(),
        updated_at=timezone.now(),
    )
    previous_status = _normalize_status(report.status)
    report.status = _normalize_status(supporting_information.get('status', report.status))
    report.supporting_details = supporting_information
    report.save(update_fields=['status', 'supporting_details', 'updated_at'])
    if report.status != previous_status:
        _record_status_history(report.id, report.status, f'Status changed to {report.status}.')

    persisted_status = _normalize_status(supporting_information.get('status', report.status))
    progress = _progress_values(submission.supporting_information, persisted_status)
    return JsonResponse({
        'id': report.id,
        'status': persisted_status,
        'generalInformation': progress['resolved' if persisted_status == 'resolved' else 'underInvestigation'],
        'resolvedInvestigationProgress': progress['resolved'],
        'underInvestigationProgress': progress['underInvestigation'],
    })


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def reports(request):
    if request.method == 'GET':
        tracking_number = request.GET.get('tracking_number', '').strip()
        if tracking_number:
            report = CrimeReport.objects.filter(
                Q(tracking_number_en__iexact=tracking_number)
                | Q(tracking_number_am__iexact=tracking_number)
            ).first()
            if not report:
                return JsonResponse([], safe=False)
            submission = ReportSubmission.objects.filter(report_id=report.id).order_by('-created_at').first()
            return JsonResponse([_citizen_report_data(report, submission)], safe=False)

        authentication_error = _dashboard_required(request)
        if authentication_error:
            return authentication_error
        dashboard_user = _dashboard_user(request) or {}
        report_subcity = dashboard_user.get('subcity', '') if dashboard_user.get('role') == 'police' else ''
        return JsonResponse(_database_report_data(report_subcity), safe=False)

    uploaded_files = []
    if request.content_type and request.content_type.startswith('multipart/form-data'):
        try:
            payload = json.loads(request.POST.get('payload', '{}'))
        except json.JSONDecodeError:
            return JsonResponse({'error': 'The report payload must be valid JSON.'}, status=400)
        uploaded_files = request.FILES.getlist('evidence')
        evidence_error = _validate_uploaded_evidence(uploaded_files)
        if evidence_error:
            return JsonResponse({'error': evidence_error}, status=400)
    else:
        try:
            payload = json.loads(request.body or '{}')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Request body must be valid JSON.'}, status=400)

    subcity = str(
        payload.get('subcity')
        or payload.get('incident_subcity')
        or (payload.get('supporting_details') or {}).get('incident_subcity')
        or ''
    ).strip()
    if not subcity:
        return JsonResponse({'error': 'subcity is required.'}, status=400)

    report_type = str(payload.get('report_type') or payload.get('incident_type') or '').strip()
    incident_type = str(payload.get('incident_type') or report_type).strip()
    if not report_type:
        return JsonResponse({'error': 'report_type or incident_type is required.'}, status=400)
    status = _normalize_status(payload.get('status') or 'new')
    reporter_details = payload.get('reporter_details') or {}
    incident_details = payload.get('incident_details') or {}
    supporting_details = payload.get('supporting_details') or {}
    raw_payload = payload.get('raw_payload') or {}
    evidence = payload.get('evidence') or []
    tracking_number = _new_tracking_number()

    with transaction.atomic():
        report = CrimeReport.objects.create(
            report_type=report_type,
            language=payload.get('language') or 'en',
            anonymous_email=payload.get('anonymous_email') or reporter_details.get('anonymous_email'),
            full_name=payload.get('full_name') or reporter_details.get('full_name'),
            email=payload.get('email') or reporter_details.get('email'),
            phone=payload.get('phone') or reporter_details.get('phone'),
            sex=payload.get('sex') or reporter_details.get('sex'),
            age=payload.get('age') or reporter_details.get('age'),
            subcity=subcity,
            kebele=payload.get('kebele') or reporter_details.get('kebele') or '',
            incident_type=incident_type,
            status=status,
            description=payload.get('description') or '',
            reporter_details=reporter_details,
            incident_details=incident_details,
            supporting_details=supporting_details,
            raw_payload=raw_payload,
            evidence=evidence,
            source_am=payload.get('source_am') or {},
            source_en=payload.get('source_en') or {},
            question_answers=payload.get('question_answers') or [],
            tracking_number_en=tracking_number,
            tracking_number_am=tracking_number,
        )
        evidence.extend(_save_report_evidence(uploaded_file, report.id) for uploaded_file in uploaded_files)
        if uploaded_files:
            report.evidence = evidence
            report.save(update_fields=['evidence', 'updated_at'])
        ReportSubmission.objects.create(
            report_id=report.id,
            reporting_mode='anonymous' if reporter_details.get('anonymous') else 'contact',
            personal_information=reporter_details,
            incident_information={
                **incident_details,
                'report_type': report_type,
                'incident_type': incident_type,
                'incident_subcity': subcity,
                'incident_kebele': payload.get('kebele') or reporter_details.get('kebele') or '',
            },
            supporting_information={**supporting_details, 'status': status},
            raw_form_data=raw_payload,
            evidence=evidence,
            created_at=report.created_at or timezone.now(),
            updated_at=timezone.now(),
        )
        _record_status_history(report.id, 'new', 'Report submitted.')
        _record_status_history(report.id, 'new', 'Report received by the police department.')

    return JsonResponse({'id': report.id, 'status': report.status, 'trackingNumber': tracking_number}, status=201)


def report_detail(request, report_id):
    try:
        report = CrimeReport.objects.get(id=report_id)
    except CrimeReport.DoesNotExist:
        return JsonResponse({'error': 'Report not found.'}, status=404)

    if request.method == 'PATCH':
        authentication_error = _dashboard_required(request)
        if authentication_error:
            return authentication_error
        scope_error = _report_scope_error(request, report_id)
        if scope_error:
            return scope_error
        try:
            payload = json.loads(request.body or '{}')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Request body must be valid JSON.'}, status=400)

        previous_status = _normalize_status(report.status)
        if 'status' in payload:
            report.status = _normalize_status(payload.get('status'))
        progress_value = payload.get('investigation_progress', payload.get('general_information'))
        progress_key = _progress_key(payload.get('status', report.status))
        if progress_value is not None and progress_key:
            supporting_details = report.supporting_details or {}
            supporting_details[progress_key] = str(progress_value or '').strip()
            report.supporting_details = supporting_details

        report.save(update_fields=['status', 'supporting_details'])
        if report.status != previous_status:
            _record_status_history(report.id, report.status, f'Status changed to {report.status}.')
        progress = _progress_values(report.supporting_details, report.status)
        return JsonResponse({
            'id': report.id,
            'status': report.status,
            'generalInformation': progress['resolved' if _normalize_status(report.status) == 'resolved' else 'underInvestigation'],
            'resolvedInvestigationProgress': progress['resolved'],
            'underInvestigationProgress': progress['underInvestigation'],
        })

    submission = ReportSubmission.objects.filter(report_id=report.id).order_by('-updated_at', '-created_at').first()
    if _dashboard_user(request):
        return JsonResponse(_report_data(report, submission))
    return JsonResponse(_citizen_report_data(report, submission))


@csrf_exempt
@require_http_methods(['GET', 'POST', 'DELETE'])
def dashboard_auth(request):
    if request.method == 'GET':
        dashboard_user = _dashboard_user(request)
        if not dashboard_user:
            return JsonResponse({'authenticated': False}, status=401)
        return JsonResponse({'authenticated': True, **dashboard_user})

    if request.method == 'DELETE':
        request.session.flush()
        return JsonResponse({'authenticated': False})

    try:
        payload = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Request body must be valid JSON.'}, status=400)

    role = str(payload.get('role') or 'police').strip().lower()
    name = str(payload.get('name') or '').strip()
    password = str(payload.get('password') or '').strip()
    subcity = str(payload.get('subcity') or '').strip()
    unique_number = str(payload.get('unique_number') or '').strip()
    if not name or not password:
        return JsonResponse({'error': 'Name and password are required.'}, status=400)

    if role == 'admin':
        if name.casefold() != str(settings.ADMIN_LOGIN_NAME).strip().casefold() or password != settings.ADMIN_LOGIN_PASSWORD:
            return JsonResponse({'error': 'Invalid admin credentials.'}, status=401)
        request.session['dashboard_user'] = {'role': 'admin', 'name': name}
        return JsonResponse({'authenticated': True, 'role': 'admin', 'name': name})

    if not subcity or not unique_number:
        return JsonResponse({'error': 'Sub-city and unique number are required.'}, status=400)
    officer = Officer.objects.filter(
        name__iexact=name,
        subcity=subcity,
        unique_number=unique_number,
    ).first()
    if not officer:
        return JsonResponse({'error': 'The entered officer information was not found.'}, status=401)
    password_matches = check_password(password, officer.password)
    if not password_matches and officer.password == password:
        officer.password = make_password(password)
        officer.save(update_fields=['password', 'updated_at'])
        password_matches = True
    if not password_matches:
        return JsonResponse({'error': 'Invalid officer credentials.'}, status=401)

    request.session['dashboard_user'] = {
        'role': 'police',
        'name': officer.name,
        'subcity': officer.subcity,
        'officer_id': officer.id,
    }
    return JsonResponse({'authenticated': True, 'role': 'police', 'name': officer.name, 'subcity': officer.subcity})


def _serialize_officer(officer):
    return {
        'id': officer.id,
        'name': officer.name,
        'password': officer.password,
        'unique_number': officer.unique_number,
        'subcity': officer.subcity,
        'created_at': officer.created_at.isoformat() if officer.created_at else None,
        'updated_at': officer.updated_at.isoformat() if officer.updated_at else None,
    }


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def officers(request):
    authentication_error = _dashboard_role_required(request, 'admin')
    if authentication_error:
        return authentication_error
    if request.method == 'GET':
        officer_list = [
            _serialize_officer(officer)
            for officer in Officer.objects.order_by('-created_at')
        ]
        return JsonResponse(officer_list, safe=False)

    try:
        payload = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Request body must be valid JSON.'}, status=400)

    name = str(payload.get('name') or '').strip()
    password = str(payload.get('password') or '').strip()
    unique_number = str(payload.get('unique_number') or payload.get('uniqueNumber') or '').strip()
    subcity = str(payload.get('subcity') or '').strip()
    if not name or not password:
        return JsonResponse({'error': 'Officer name and password are required.'}, status=400)

    officer = Officer.objects.create(name=name, password=make_password(password), unique_number=unique_number, subcity=subcity)
    return JsonResponse(_serialize_officer(officer), status=201)


@csrf_exempt
@require_http_methods(['PATCH', 'DELETE'])
def officer_detail(request, officer_id):
    authentication_error = _dashboard_role_required(request, 'admin')
    if authentication_error:
        return authentication_error
    try:
        officer = Officer.objects.get(id=officer_id)
    except Officer.DoesNotExist:
        return JsonResponse({'error': 'Officer not found.'}, status=404)

    if request.method == 'DELETE':
        officer.delete()
        return JsonResponse({'deleted': True, 'id': officer_id})

    try:
        payload = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Request body must be valid JSON.'}, status=400)

    if 'name' in payload:
        officer.name = str(payload.get('name') or '').strip() or officer.name
    if 'password' in payload:
        password = str(payload.get('password') or '').strip()
        if password:
            officer.password = make_password(password)
    if 'unique_number' in payload or 'uniqueNumber' in payload:
        officer.unique_number = str(payload.get('unique_number', payload.get('uniqueNumber')) or '').strip()
    if 'subcity' in payload:
        officer.subcity = str(payload.get('subcity') or '').strip()

    if not officer.name or not officer.password:
        return JsonResponse({'error': 'Officer name and password are required.'}, status=400)

    officer.save(update_fields=['name', 'password', 'unique_number', 'subcity', 'updated_at'])
    return JsonResponse(_serialize_officer(officer))
