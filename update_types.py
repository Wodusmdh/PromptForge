with open('src/intelligence/types.ts', 'r') as f:
    content = f.read()

if "routingMode?: \"LOCAL_ONLY\" | \"CLOUD_ALLOWED\" | \"USER_DECIDES\";" not in content:
    content = content.replace(
        'maxCostPer1k?: number;',
        'maxCostPer1k?: number;\n  routingMode?: "LOCAL_ONLY" | "CLOUD_ALLOWED" | "USER_DECIDES";'
    )

with open('src/intelligence/types.ts', 'w') as f:
    f.write(content)
