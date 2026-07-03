"""Parse browser, device, and OS from User-Agent strings."""

from ua_parser import parse as ua_parse


def parse_user_agent(user_agent: str | None) -> dict[str, str | None]:
    """
    Parse a User-Agent header string into browser, device, and OS components.

    Returns:
        dict with keys: browser, device, os
    """
    if not user_agent:
        return {"browser": None, "device": None, "os": None}

    result = ua_parse(user_agent)

    browser: str | None = None
    if result.user_agent and result.user_agent.family:
        browser = result.user_agent.family

    os_name: str | None = None
    if result.os and result.os.family:
        os_name = result.os.family

    device: str | None = None
    if result.device and result.device.family:
        raw = result.device.family
        # ua-parser returns 'Other' for unknown desktop browsers
        device = None if raw == "Other" else raw
        if device is None:
            # Infer from OS
            if os_name in ("Windows", "Mac OS X", "Linux", "Chrome OS"):
                device = "Desktop"
            elif os_name in ("iOS", "Android"):
                device = "Mobile"

    return {"browser": browser, "device": device, "os": os_name}
