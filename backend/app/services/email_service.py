"""EmailService — sends transactional emails via Brevo's REST API.

No SDK required: we POST directly to the v3 API with httpx.
All methods are synchronous (called from sync FastAPI request handlers).
"""

import logging
from datetime import datetime

import httpx

from app.config.settings import settings

logger = logging.getLogger(__name__)

BREVO_URL = "https://api.brevo.com/v3/smtp/email"


def _send(*, to_email: str, to_name: str, subject: str, html_body: str) -> None:
    """Fire-and-forget a single transactional email. Logs but never raises."""
    if not settings.BREVO_API_KEY:
        logger.warning("BREVO_API_KEY not set — skipping email to %s", to_email)
        return

    payload = {
        "sender":    {"name": settings.BREVO_SENDER_NAME, "email": settings.BREVO_SENDER_EMAIL},
        "to":        [{"email": to_email, "name": to_name or to_email}],
        "subject":   subject,
        "htmlContent": html_body,
    }
    headers = {
        "api-key":     settings.BREVO_API_KEY,
        "content-type": "application/json",
        "accept":       "application/json",
    }

    try:
        resp = httpx.post(BREVO_URL, json=payload, headers=headers, timeout=8)
        if resp.status_code >= 300:
            logger.error("Brevo error %s: %s", resp.status_code, resp.text[:300])
        else:
            logger.info("Email sent to %s (subject=%s)", to_email, subject)
    except Exception as exc:
        logger.error("Email send failed for %s: %s", to_email, exc)


# ─── Template helpers ──────────────────────────────────────────────────────────

def _base_html(content: str) -> str:
    """Minimal but polished HTML wrapper matching TinyLink brand."""
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TinyLink</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:12px;border:1px solid #e2e2e7;
                    box-shadow:0 1px 3px rgba(0,0,0,.08);overflow:hidden;max-width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0a0a0f;padding:24px 32px;text-align:center;">
            <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">
              Tiny<span style="color:#6366f1;">Link</span>
            </span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            {content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #ebebef;text-align:center;">
            <p style="margin:0;font-size:12px;color:#717180;">
              TinyLink &mdash; Professional URL shortener
              &nbsp;&bull;&nbsp;
              <a href="https://github.com/harivansh-b/tinylink"
                 style="color:#6366f1;text-decoration:none;">GitHub</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""


# ─── Public helpers ────────────────────────────────────────────────────────────

def send_welcome_email(*, email: str, name: str) -> None:
    display = name or email.split("@")[0]
    html = _base_html(f"""
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0a0a0f;letter-spacing:-0.02em;">
        Welcome to TinyLink, {display}!
      </h1>
      <p style="margin:0 0 20px;font-size:14px;color:#3d3d47;line-height:1.6;">
        Your account is ready. Start shortening URLs, tracking clicks, and sharing 
        analytics-powered links in seconds.
      </p>
      <a href="http://localhost:5173/dashboard"
         style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;
                border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
        Go to Dashboard
      </a>
      <p style="margin:24px 0 0;font-size:13px;color:#717180;">
        Questions? Just reply to this email.
      </p>
    """)
    _send(to_email=email, to_name=display, subject="Welcome to TinyLink!", html_body=html)


def send_link_created_email(
    *, email: str, name: str, short_url: str, original_url: str
) -> None:
    display = name or email.split("@")[0]
    truncated = original_url if len(original_url) <= 60 else original_url[:57] + "..."
    html = _base_html(f"""
      <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0a0a0f;letter-spacing:-0.02em;">
        Your short link is live
      </h1>
      <p style="margin:0 0 20px;font-size:14px;color:#3d3d47;line-height:1.6;">
        Hi {display}, a new short link has been created.
      </p>
      <table cellpadding="0" cellspacing="0" width="100%"
             style="background:#f9f9fa;border:1px solid #e2e2e7;border-radius:8px;padding:16px;margin-bottom:20px;">
        <tr>
          <td style="font-size:12px;color:#717180;font-weight:600;text-transform:uppercase;
                     letter-spacing:.06em;padding-bottom:6px;">Short URL</td>
        </tr>
        <tr>
          <td>
            <a href="{short_url}"
               style="font-size:16px;font-weight:700;color:#6366f1;text-decoration:none;
                      font-family:monospace;">{short_url}</a>
          </td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#717180;padding-top:12px;padding-bottom:4px;font-weight:600;
                     text-transform:uppercase;letter-spacing:.06em;">Destination</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#3d3d47;">{truncated}</td>
        </tr>
      </table>
      <a href="{short_url}"
         style="display:inline-block;padding:11px 22px;background:#6366f1;color:#fff;
                border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
        Visit link
      </a>
    """)
    _send(to_email=email, to_name=display, subject=f"Short link created: {short_url}", html_body=html)


def send_plan_upgraded_email(
    *, email: str, name: str, plan: str, amount_inr: int
) -> None:
    display = name or email.split("@")[0]
    plan_cap = plan.capitalize()
    html = _base_html(f"""
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0a0a0f;letter-spacing:-0.02em;">
        You're now on the {plan_cap} plan
      </h1>
      <p style="margin:0 0 20px;font-size:14px;color:#3d3d47;line-height:1.6;">
        Hi {display}, your payment of
        <strong style="color:#0a0a0f;">&#8377;{amount_inr:,}</strong>
        was successful. Your account has been upgraded to <strong>{plan_cap}</strong>.
      </p>
      <table cellpadding="0" cellspacing="0" width="100%"
             style="background:#f9f9fa;border:1px solid #e2e2e7;border-radius:8px;
                    padding:16px;margin-bottom:24px;">
        <tr>
          <td style="font-size:13px;color:#717180;">Plan</td>
          <td style="font-size:13px;font-weight:600;color:#0a0a0f;text-align:right;">{plan_cap}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#717180;padding-top:8px;">Amount paid</td>
          <td style="font-size:13px;font-weight:600;color:#0a0a0f;text-align:right;padding-top:8px;">
            &#8377;{amount_inr:,}
          </td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#717180;padding-top:8px;">Date</td>
          <td style="font-size:13px;color:#0a0a0f;text-align:right;padding-top:8px;">
            {datetime.utcnow().strftime('%d %b %Y')}
          </td>
        </tr>
      </table>
      <a href="http://localhost:5173/dashboard"
         style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;
                border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
        Explore your new features
      </a>
    """)
    _send(
        to_email=email, to_name=display,
        subject=f"TinyLink {plan_cap} plan activated!",
        html_body=html,
    )


def send_link_expiry_email(
    *, email: str, name: str, short_url: str, original_url: str, expired_at: str
) -> None:
    """Notify the owner that one of their short links has expired."""
    display = name or email.split("@")[0]
    truncated = original_url if len(original_url) <= 60 else original_url[:57] + "..."
    html = _base_html(f"""
      <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0a0a0f;letter-spacing:-0.02em;">
        Your short link has expired
      </h1>
      <p style="margin:0 0 20px;font-size:14px;color:#3d3d47;line-height:1.6;">
        Hi {display}, the following short link reached its expiration date and is
        no longer active. Visitors who click it will see a link-expired page.
      </p>
      <table cellpadding="0" cellspacing="0" width="100%"
             style="background:#fff8f1;border:1px solid #fed7aa;border-radius:8px;
                    padding:16px;margin-bottom:20px;">
        <tr>
          <td style="font-size:12px;color:#9a3412;font-weight:600;text-transform:uppercase;
                     letter-spacing:.06em;padding-bottom:6px;">Short URL</td>
        </tr>
        <tr>
          <td>
            <span style="font-size:16px;font-weight:700;color:#ea580c;
                         font-family:monospace;">{short_url}</span>
          </td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#9a3412;padding-top:12px;padding-bottom:4px;
                     font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Destination</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#3d3d47;">{truncated}</td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#9a3412;padding-top:12px;padding-bottom:4px;
                     font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Expired at</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#3d3d47;">{expired_at}</td>
        </tr>
      </table>
      <p style="margin:0 0 16px;font-size:13px;color:#717180;line-height:1.6;">
        You can create a new link or reactivate it without an expiry from your dashboard.
      </p>
      <a href="http://localhost:5173/links"
         style="display:inline-block;padding:11px 22px;background:#6366f1;color:#fff;
                border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
        Manage my links
      </a>
    """)
    _send(
        to_email=email, to_name=display,
        subject=f"Short link expired: {short_url}",
        html_body=html,
    )


def send_plan_expiry_email(
    *, email: str, name: str, plan: str, expired_at: str
) -> None:
    """Notify the user that their subscription plan has expired and they've been downgraded."""
    display = name or email.split("@")[0]
    plan_cap = plan.capitalize()
    html = _base_html(f"""
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0a0a0f;letter-spacing:-0.02em;">
        Your {plan_cap} plan has expired
      </h1>
      <p style="margin:0 0 20px;font-size:14px;color:#3d3d47;line-height:1.6;">
        Hi {display}, your <strong>{plan_cap}</strong> subscription expired on
        <strong style="color:#0a0a0f;">{expired_at}</strong>.
        Your account has been moved back to the <strong>Starter</strong> (free) plan.
      </p>
      <table cellpadding="0" cellspacing="0" width="100%"
             style="background:#fdf2f8;border:1px solid #f0abda;border-radius:8px;
                    padding:16px;margin-bottom:24px;">
        <tr>
          <td style="font-size:13px;color:#86198f;">Previous plan</td>
          <td style="font-size:13px;font-weight:600;color:#0a0a0f;text-align:right;">{plan_cap}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#86198f;padding-top:8px;">Current plan</td>
          <td style="font-size:13px;font-weight:600;color:#0a0a0f;text-align:right;padding-top:8px;">
            Starter (Free)
          </td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#86198f;padding-top:8px;">Expired on</td>
          <td style="font-size:13px;color:#0a0a0f;text-align:right;padding-top:8px;">{expired_at}</td>
        </tr>
      </table>
      <p style="margin:0 0 16px;font-size:13px;color:#717180;line-height:1.6;">
        To continue enjoying premium features — advanced analytics, custom aliases,
        link expiry, and priority support — renew your subscription anytime.
      </p>
      <a href="http://localhost:5173/#pricing"
         style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;
                border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
        Renew my plan
      </a>
    """)
    _send(
        to_email=email, to_name=display,
        subject=f"Your TinyLink {plan_cap} plan has expired",
        html_body=html,
    )

