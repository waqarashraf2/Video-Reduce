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

    // Format bold and code within the line
    const formattedLine = rawLine
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-blue-400 font-mono text-xs">$1</code>');

    if (formattedLine.startsWith("#### ")) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(`<h4 class="text-lg font-bold text-blue-300 mt-6 mb-2">${formattedLine.slice(5)}</h4>`);
    } else if (formattedLine.startsWith("### ")) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(`<h3 class="text-xl font-bold text-white mt-8 mb-3">${formattedLine.slice(4)}</h3>`);
    } else if (formattedLine.startsWith("## ")) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(`<h2 class="text-2xl font-bold text-white mt-10 mb-4 border-b border-white/10 pb-2">${formattedLine.slice(3)}</h2>`);
    } else if (formattedLine.startsWith("---")) {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push('<hr class="border-white/10 my-8" />');
    } else if (
      formattedLine.startsWith("- ") ||
      formattedLine.startsWith("1. ") ||
      formattedLine.startsWith("2. ") ||
      formattedLine.startsWith("3. ") ||
      formattedLine.startsWith("4. ")
    ) {
      if (!inList) {
        htmlParts.push('<ul class="space-y-2 my-4 list-disc list-inside text-slate-300">');
        inList = true;
      }
      const itemText = formattedLine.replace(/^[-*]|\d+\.\s*/, "").trim();
      htmlParts.push(`<li class="leading-relaxed">${itemText}</li>`);
    } else {
      if (inList) {
        htmlParts.push("</ul>");
        inList = false;
      }
      htmlParts.push(`<p class="text-slate-300 leading-relaxed mb-4">${formattedLine}</p>`);
    }
  }

  if (inList) {
    htmlParts.push("</ul>");
  }

  return htmlParts.join("\n");
}
