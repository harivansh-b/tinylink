"""QR code generation utilities."""

import base64
import io

import qrcode
from qrcode.image.pure import PyPNGImage


def generate_qr_base64(url: str, box_size: int = 10, border: int = 4) -> str:
    """
    Generate a QR code for the given URL and return a base64-encoded PNG string.

    Args:
        url: The URL to encode in the QR code.
        box_size: Pixel size of each QR box (default 10).
        border: QR quiet zone border size (default 4).

    Returns:
        Base64-encoded PNG data URI string (data:image/png;base64,...).
    """
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=box_size,
        border=border,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(image_factory=PyPNGImage)
    buffer = io.BytesIO()
    img.save(buffer)
    buffer.seek(0)

    encoded = base64.b64encode(buffer.read()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"


def generate_qr_bytes(url: str, box_size: int = 10, border: int = 4) -> bytes:
    """
    Generate a QR code for the given URL and return raw PNG bytes.

    Args:
        url: The URL to encode.

    Returns:
        PNG image bytes.
    """
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=box_size,
        border=border,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(image_factory=PyPNGImage)
    buffer = io.BytesIO()
    img.save(buffer)
    buffer.seek(0)
    return buffer.read()
