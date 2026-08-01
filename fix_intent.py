with open('src/compiler/core/intentAnalyzer.ts', 'r') as f:
    code = f.read()

import re
replacement = """    if (text.includes("translate") || text.includes("translation") || text.includes("japanese") || text.includes("spanish")) {
      intentType = "Translation";
    } else if (text.includes("math") || text.includes("+") || text.includes("-") || text.includes("calculate") || text.includes("equation")) {
      intentType = "Mathematics";
    } else if (text.includes("explain") || text.includes("tutorial") || text.includes("learn") || text.includes("education")) {
      intentType = "Education";
    } else if (text.includes("build") || text.includes("code") || text.includes("react") || text.includes("api") || text.includes("backend") || text.includes("frontend")) {
      intentType = "Coding";
"""
code = re.sub(r'    if \(text\.includes\("build"\)[\s\S]*?intentType = "Coding";\n', replacement, code)
with open('src/compiler/core/intentAnalyzer.ts', 'w') as f:
    f.write(code)
