import io
import shutil
from pathlib import Path

import fitz
from PIL import Image

pdf_path = Path(r"c:\Users\mmoba\OneDrive\سطح المكتب\AD_Solutions_Beef_Station_Proposal.pdf")
stamp_path = Path(
    r"C:\Users\mmoba\.cursor\projects\c-Mobarez-Develop-Marketly\assets"
    r"\c__Users_mmoba_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images"
    r"_AD_solutions_stamp-f1873b25-41a4-4d66-b7ba-b3d71a0dc7aa.png"
)
backup_path = pdf_path.with_name(pdf_path.stem + "_backup_before_edit.pdf")
signed_path = pdf_path.with_name(pdf_path.stem + "_SIGNED.pdf")
out_preview = Path(r"c:\Mobarez\Develop\Marketly\_pdf_preview")


def rgb_pdf(r, g, b):
    return (r / 255, g / 255, b / 255)


def sample_bg(page, rect):
    pix = page.get_pixmap(clip=rect, matrix=fitz.Matrix(1, 1))
    n = pix.n
    samples = pix.samples
    rs = gs = bs = 0
    count = pix.width * pix.height
    for i in range(0, len(samples), n):
        rs += samples[i]
        gs += samples[i + 1]
        bs += samples[i + 2]
    return rgb_pdf(rs // count, gs // count, bs // count)


if not backup_path.exists():
    backup_path.write_bytes(pdf_path.read_bytes())
    print("Backup created:", backup_path)

doc = fitz.open(backup_path)

# ===================== PAGE 3 =====================
page = doc[2]
# Option A card fill from original drawing: rgb(0.118, 0.137, 0.169) ≈ (30, 35, 43)
option_a_dark = (0.118, 0.137, 0.169)
badge_dark = rgb_pdf(40, 46, 52)

# Remove only " admin" so text reads "...and 10" / "users included."
for r in page.search_for(" admin"):
    if 330 < r.y0 < 345 and r.x0 > 200:
        page.add_redact_annot(r + (-0.2, -0.5, 0.5, 0.7), fill=option_a_dark)

# Replace badge text: redact whole badge phrase, rewrite "10 users"
badge_hits = [r for r in page.search_for("10 admin users") if 365 < r.y0 < 385]
for r in badge_hits:
    page.add_redact_annot(r + (-0.5, -0.6, 0.5, 0.8), fill=badge_dark)
page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

for r in badge_hits:
    text = "10 users"
    fs = 7.5
    tw = fitz.get_text_length(text, fontname="helv", fontsize=fs)
    x = r.x0 + (r.width - tw) / 2
    y = r.y0 + r.height * 0.78
    page.insert_text((x, y), text, fontsize=fs, fontname="helv", color=(1, 1, 1))

# ===================== PAGE 6 =====================
page = doc[5]
# Replace full licensing line cleanly (avoids grey gap from mid-word redaction)
lic_bg = (0.9686, 0.9725, 0.9804)  # Option A licensing card fill
lic_hits = page.search_for("Includes 10 administrator users")
lic_meta = []
for full in lic_hits:
    lic_meta.append(fitz.Rect(full))
    page.add_redact_annot(full + (-0.4, -0.6, 1.0, 0.8), fill=lic_bg)
page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

# Original span color integer 2765116 ≈ dark charcoal
lic_color = ((2765116 >> 16) & 255) / 255, ((2765116 >> 8) & 255) / 255, (2765116 & 255) / 255
for full in lic_meta:
    page.insert_text(
        (full.x0, full.y0 + full.height * 0.78),
        "Includes 10 users",
        fontsize=9.0,
        fontname="helv",
        color=lic_color,
    )

# ===================== PAGE 8 =====================
page = doc[7]
form_bg = rgb_pdf(252, 252, 252)
val_color = rgb_pdf(45, 52, 60)
field_x0 = 379.5
field_x1 = 533.2
fontsize_field = 8.6

# Replace company value
for r in page.search_for("AD Solutions"):
    if 320 < r.y0 < 350:
        page.add_redact_annot(r + (-0.5, -0.5, 1.0, 0.8), fill=form_bg)
page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)

fields = [
    ("Mohamed Mobarez", 299.2),
    ("Sales Manager", 321.8),
    ("AD Solutions L.L.C", 344.2),
    ("07-23-2026", 366.8),
]

for text, underline_y in fields:
    # clear field writing area without covering the underline
    clear = fitz.Rect(field_x0, underline_y - 12.0, field_x1, underline_y - 1.8)
    page.draw_rect(clear, color=None, fill=form_bg, width=0)
    page.insert_text(
        (field_x0, underline_y - 4.0),
        text,
        fontsize=fontsize_field,
        fontname="helv",
        color=val_color,
    )

# Stamp under date / in signature area
stamp_img = Image.open(stamp_path).convert("RGBA")
buf = io.BytesIO()
stamp_img.save(buf, format="PNG")
stamp_bytes = buf.getvalue()

stamp_size = 72.0
vendor_left, vendor_right = 315.0, 533.2
stamp_y0 = 368.5
stamp_x0 = (vendor_left + vendor_right - stamp_size) / 2
stamp_rect = fitz.Rect(stamp_x0, stamp_y0, stamp_x0 + stamp_size, stamp_y0 + stamp_size)
page.insert_image(stamp_rect, stream=stamp_bytes, keep_proportion=True, overlay=True)
print("Stamp placed at", stamp_rect)

tmp_path = out_preview / "proposal_edited_tmp.pdf"
doc.save(tmp_path, garbage=4, deflate=True)
doc.close()

saved = []
for target in (pdf_path, signed_path):
    try:
        shutil.copy2(tmp_path, target)
        saved.append(target)
        print("Saved:", target)
    except Exception as e:
        print("Could not write", target, "->", e)

if not saved:
    raise SystemExit("Unable to save edited PDF; close it if open and retry.")

verify_path = signed_path if signed_path in saved else saved[0]
doc = fitz.open(verify_path)
for i in [2, 5, 7]:
    pix = doc[i].get_pixmap(matrix=fitz.Matrix(2, 2))
    pix.save(str(out_preview / f"page{i+1}_edited.png"))

page = doc[5]
clip = fitz.Rect(60, 290, 290, 380)
doc[5].get_pixmap(clip=clip, matrix=fitz.Matrix(3, 3)).save(str(out_preview / "p6_crop.png"))

t3 = doc[2].get_text()
t6 = doc[5].get_text()
t8 = doc[7].get_text()
print("P3 '10 admin users' still present:", "10 admin users" in t3)
print("P3 '10 users' present:", "10 users" in t3)
print("P6 line:", [ln for ln in t6.splitlines() if "Includes" in ln or "administrator" in ln])
print("P8 ok:", all(s in t8 for s in ["Mohamed Mobarez", "Sales Manager", "AD Solutions L.L.C", "07-23-2026"]))
doc.close()
print("Done")
