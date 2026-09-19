export function parseArticleMarkdown(content: string): string {
  const lines = content.trim().split("\n");
  const htmlParts: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();

    if (!rawLine) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      continue;
    }

    // Format bold, links, and code within the line
    const formattedLine = rawLine
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-950 font-bold">$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2">$1</a>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200">$1</code>');

    if (formattedLine.startsWith("#### ")) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(`<h4 class="text-lg font-bold text-slate-900 mt-6 mb-2">${formattedLine.slice(5)}</h4>`);
    } else if (formattedLine.startsWith("### ")) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(`<h3 class="text-xl font-extrabold text-slate-900 mt-8 mb-3">${formattedLine.slice(4)}</h3>`);
    } else if (formattedLine.startsWith("## ")) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(`<h2 class="text-2xl font-black text-slate-900 mt-10 mb-4 border-b border-slate-200 pb-2">${formattedLine.slice(3)}</h2>`);
    } else if (formattedLine.startsWith("---")) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push('<hr class="border-slate-200 my-8" />');
    } else if (
      formattedLine.startsWith("- ") ||
      formattedLine.startsWith("1. ") ||
      formattedLine.startsWith("2. ") ||
      formattedLine.startsWith("3. ") ||
      formattedLine.startsWith("4. ")
    ) {
      if (!inList) {
        htmlParts.push('<ul class="space-y-2 my-4 list-disc list-inside text-slate-700">');
        inList = true;
      }
      const itemText = formattedLine.replace(/^[-*]|\d+\.\s*/, "").trim();
      htmlParts.push(`<li class="leading-relaxed text-slate-700">${itemText}</li>`);
    } else {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(`<p class="text-slate-700 text-base sm:text-lg leading-relaxed mb-4">${formattedLine}</p>`);
    }
  }

  if (inList) {
    htmlParts.push("</ul>");
  }

  return htmlParts.join("\n");
}
