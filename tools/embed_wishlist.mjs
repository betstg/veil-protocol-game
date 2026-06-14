/* Inline the image wishlist directly into the tracker's Wishlist pane (replacing the iframe).
 * All wishlist CSS is scoped under #wl-embed so it can't clash with the tracker's own styles. */
import fs from "fs";
const ROOT = new URL("..", import.meta.url).pathname;
const wl = fs.readFileSync(ROOT + "veil-protocol-image-wishlist.html", "utf8");
let tracker = fs.readFileSync(ROOT + "veil-protocol-tracker.html", "utf8");

const styleInner = (wl.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || "";
const bodyInner = (wl.match(/<body>([\s\S]*?)<\/body>/) || [])[1] || "";
// separate the wishlist's trailing <script> from its markup
const scripts = [...bodyInner.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const markup = bodyInner.replace(/<script>[\s\S]*?<\/script>/g, "").trim();

/* scope every CSS rule under #wl-embed */
function scopeCss(css) {
  return css.replace(/([^{}]+)\{([^{}]*)\}/g, (_m, sel, body) => {
    const scoped = sel.split(",").map((s) => {
      s = s.trim();
      if (!s) return s;
      if (s.startsWith("@")) return s;            // at-rules untouched
      if (s === ":root") return ":root";          // keep global vars (harmless, same value)
      if (s === "body") return "#wl-embed";        // body styles → the container
      if (s === "*") return "#wl-embed *";
      return "#wl-embed " + s;
    }).join(", ");
    return `${scoped}{${body}}`;
  });
}
const scoped = scopeCss(styleInner) + "\n#wl-embed .header{position:static;border-radius:8px 8px 0 0}\n#wl-embed{border:1px solid var(--bdr);border-radius:8px;overflow:hidden;display:block}";

const embed =
`<div id="wl-embed">
<style>${scoped}</style>
${markup}
</div>
<script>${scripts.join("\n")}</script>`;

/* replace the whole p-wishlist pane body (keep the <h2> + intro line, swap the iframe for the inline embed) */
const paneRe = /(<div class="pane" id="p-wishlist">)([\s\S]*?)(<\/div>\s*<\/div>\s*<script>)/;
const newPane =
`<div class="pane" id="p-wishlist">
<h2>Image Wishlist</h2>
<p class="muted">Every image slot for the books — produced batches kept as a record, outstanding art listed with prompts. Ticks save in this browser.</p>
${embed}
</div>

</div>
<script>`;
if (!paneRe.test(tracker)) { console.error("could not locate p-wishlist pane"); process.exit(1); }
tracker = tracker.replace(paneRe, newPane);
fs.writeFileSync(ROOT + "veil-protocol-tracker.html", tracker);
console.log("embedded wishlist into tracker (" + tracker.length + " chars; " + (markup.match(/class="row"/g) || []).length + " rows inlined)");
