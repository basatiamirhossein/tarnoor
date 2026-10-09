#!/usr/bin/env python3
"""Assemble Tarnoor v3 into one self-contained, offline index.html."""
import base64, json, pathlib, re, subprocess, sys
ROOT = pathlib.Path(__file__).resolve().parent
SRC, FONTS = ROOT / "src", ROOT / "fonts"
AR = "U+0600-06FF,U+0750-077F,U+0870-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC"
LAT = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
FACES = [("Estedad", "300 800", "estedad-ar", AR), ("Estedad", "300 800", "estedad-lat", LAT),
         ("Inter", "400 800", "inter-lat", LAT), ("Noto Kufi Arabic", "400 800", "kufi-ar", AR),
         ("IBM Plex Mono", "400", "mono-400", LAT), ("IBM Plex Mono", "500", "mono-500", LAT)]

def font_css():
    out = []
    for fam, w, f, rng in FACES:
        b64 = base64.b64encode((FONTS / f"{f}.woff2").read_bytes()).decode()
        out.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};font-display:swap;"
                   f"src:url(data:font/woff2;base64,{b64}) format('woff2');unicode-range:{rng}}}")
    return "\n".join(out)

def icons():
    js = (SRC / "art.js").read_text(encoding="utf8") + "\nprocess.stdout.write(JSON.stringify(IC));"
    return json.loads(subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True).stdout)

def main():
    shell = (SRC / "shell.html").read_text(encoding="utf8")
    ic = icons()
    shell = re.sub(r"@@IC\.(\w+)@@", lambda m: ic[m.group(1)], shell)
    css = (SRC / "style.css").read_text(encoding="utf8")
    js = "\n".join((SRC / f).read_text(encoding="utf8") for f in
                   ["data_src.js", "data_i18n.js", "art.js", "i18n.js", "app.js"])
    js = '"use strict";\n' + js.replace("</script", "<\\/script")
    html = (shell.replace("/*@@FONTS@@*/", font_css())
                 .replace("/*@@CSS@@*/", css)
                 .replace("/*@@JS@@*/", js))
    assert "@@" not in html.replace("/*@@", ""), "unreplaced token"
    (ROOT / "index.html").write_text(html, encoding="utf8")
    print(f"index.html {len(html.encode())/1024:.0f} KB")
    if len(sys.argv) > 1:
        # artifact preview: the host adds doctype/html/head/body, and printing is unavailable there
        head = re.search(r"<head>(.*?)</head>", html, re.S).group(1)
        head = re.sub(r'<meta (charset|name="viewport")[^>]*>\n?', "", head)
        head = re.sub(r"<title>.*?</title>", "<title>تارنور نسخه ۳</title>", head, count=1)
        body = re.search(r"<body>(.*?)</body>", html, re.S).group(1)
        art = head + "<style>[data-act=print]{display:none!important}</style>\n" + body
        pathlib.Path(sys.argv[1]).write_text(art, encoding="utf8")
        print("artifact", sys.argv[1])

if __name__ == "__main__":
    main()
