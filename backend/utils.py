import re
from backend.config import config

def fragment(name):
    index = (config.static_dir / "index.html").read_text()
    extension = (config.fragment_dir / name).read_text()
    html = re.sub("<body>.*</body>\\s*<script.*</script>", extension, index, flags=re.DOTALL)
    assert html != index
    return html
