import os


def vendor_mode(request):
    """
    Expose USE_LOCAL_VENDOR to templates to toggle between CDN and self-hosted assets.
    Set USE_LOCAL_VENDOR=1 in the environment to serve Bootstrap/Font Awesome from static/.
    """
    raw = os.environ.get("USE_LOCAL_VENDOR", "0").strip().lower()
    use_local = raw in ("1", "true", "yes", "on")
    return {"USE_LOCAL_VENDOR": use_local}
