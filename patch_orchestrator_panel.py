import sys

with open('src/components/ModelOrchestratorPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { RoutingStrategy, OrchestrationRun, ModelDefinition } from '../intelligence/types';", "import { RoutingStrategy, OrchestrationRun, ModelDefinition, RoutingRequirements } from '../intelligence/types';\nimport { LocalAIConfigPanel } from './LocalAIConfigPanel';")

content = content.replace("const [strategy, setStrategy] = useState<RoutingStrategy>('balanced');", "const [strategy, setStrategy] = useState<RoutingStrategy>('balanced');\n  const [routingMode, setRoutingMode] = useState<'CLOUD_ALLOWED' | 'LOCAL_ONLY' | 'USER_DECIDES'>('CLOUD_ALLOWED');")

content = content.replace("{ taskType: 'architecture', minReasoningCapability: 7 }", "{ taskType: 'architecture', minReasoningCapability: 7, routingMode }")

# Update UI to include routing mode selector
ui_replacement = """        <div>
          <label className="block text-sm font-semibold mb-2">Routing Mode</label>
          <select 
            value={routingMode}
            onChange={(e) => setRoutingMode(e.target.value as any)}
            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-slate-200"
          >
            <option value="CLOUD_ALLOWED">Cloud Allowed (Default)</option>
            <option value="LOCAL_ONLY">Local Only (Privacy)</option>
          </select>
        </div>
      </div>"""

content = content.replace("</div>\n      <button", ui_replacement + "\n      <button")

# Wrap ModelOrchestratorPanel returning jsx in a React fragment so we can append LocalAIConfigPanel
content = content.replace('    <div className="bg-slate-900', '    <>\n      <div className="bg-slate-900')
content = content.replace('      )}    </div>  );};', '      )}\n    </div>\n    <LocalAIConfigPanel />\n    </>\n  );\n};\n')
# Wait, let's just make the replace simple.
with open('patch_orchestrator_panel_v2.py', 'w') as f:
    f.write('''
import sys

with open('src/components/ModelOrchestratorPanel.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { RoutingStrategy, OrchestrationRun, ModelDefinition } from '../intelligence/types';", "import { RoutingStrategy, OrchestrationRun, ModelDefinition, RoutingRequirements } from '../intelligence/types';\\nimport { LocalAIConfigPanel } from './LocalAIConfigPanel';")

content = content.replace("const [strategy, setStrategy] = useState<RoutingStrategy>('balanced');", "const [strategy, setStrategy] = useState<RoutingStrategy>('balanced');\\n  const [routingMode, setRoutingMode] = useState<'CLOUD_ALLOWED' | 'LOCAL_ONLY' | 'USER_DECIDES'>('CLOUD_ALLOWED');")

content = content.replace("{ taskType: 'architecture', minReasoningCapability: 7 }", "{ taskType: 'architecture', minReasoningCapability: 7, routingMode }")

ui_replacement = """        <div>
          <label className="block text-sm font-semibold mb-2">Routing Mode</label>
          <select 
            value={routingMode}
            onChange={(e) => setRoutingMode(e.target.value as any)}
            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-slate-200"
          >
            <option value="CLOUD_ALLOWED">Cloud Allowed</option>
            <option value="LOCAL_ONLY">Local Only</option>
          </select>
        </div>
      </div>"""

content = content.replace("</div>\\n      <button", ui_replacement + "\\n      <button")

content = content.replace('    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-6 text-slate-200">', '    <>\\n    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 my-6 text-slate-200">')
content = content.replace('      )}\\n    </div>\\n  );\\n};', '      )}\\n    </div>\\n    <LocalAIConfigPanel />\\n    </>\\n  );\\n};')

with open('src/components/ModelOrchestratorPanel.tsx', 'w') as f:
    f.write(content)
''')
