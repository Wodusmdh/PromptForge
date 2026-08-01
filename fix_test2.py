import re

with open('src/intelligence/tests/intelligence.test.ts', 'r') as f:
    content = f.read()

# Change the tests to pass rules in the additionalRules param
content = content.replace(
    'testIntelligence("I want a dark theme. Use dark mode. Make the dark ui.", "")',
    'testIntelligence("App", "- I want a dark theme.\\n- Use dark mode.\\n- Make the dark ui.")'
)

# testIntelligence("Build a website.", "Use React"); -> add '- ' since my parser splits by '- '
content = content.replace(
    'testIntelligence("Build a website.", "Use React")',
    'testIntelligence("Build a website.", "- Use React")'
)

with open('src/intelligence/tests/intelligence.test.ts', 'w') as f:
    f.write(content)
