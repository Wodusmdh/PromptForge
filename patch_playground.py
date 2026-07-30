import sys

with open('/app/applet/src/playground/Playground.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'import { HistoryPanel } from "./components/history/HistoryPanel";',
    'import { HistoryPanel } from "./components/history/HistoryPanel";\nimport { ModelOrchestratorPanel } from "../components/ModelOrchestratorPanel";'
)

content = content.replace(
    'import { Menu, X, Hammer, BookOpen, Clock, Settings, PanelRightClose, PanelRightOpen, Terminal } from "lucide-react";',
    'import { Menu, X, Hammer, BookOpen, Clock, Settings, PanelRightClose, PanelRightOpen, Terminal, Network } from "lucide-react";'
)

content = content.replace(
    "useState<'editor' | 'rules' | 'history'>('editor');",
    "useState<'editor' | 'rules' | 'history' | 'orchestrator'>('editor');"
)

content = content.replace(
    '<NavItem \n              icon={<Clock />} \n              label="History" \n              active={activeTab === \'history\'} \n              onClick={() => { setActiveTab(\'history\'); setMobileMenuOpen(false); }} \n            />\n          </nav>',
    '<NavItem \n              icon={<Clock />} \n              label="History" \n              active={activeTab === \'history\'} \n              onClick={() => { setActiveTab(\'history\'); setMobileMenuOpen(false); }} \n            />\n            <NavItem \n              icon={<Network />} \n              label="Orchestrator" \n              active={activeTab === \'orchestrator\'} \n              onClick={() => { setActiveTab(\'orchestrator\'); setMobileMenuOpen(false); }} \n            />\n          </nav>'
)

content = content.replace(
    '<div className={`${activeTab === \'history\' ? \'flex flex-col flex-1\' : \'hidden\'}`}>\n                  <HistoryPanel />\n                </div>\n              </div>',
    '<div className={`${activeTab === \'history\' ? \'flex flex-col flex-1\' : \'hidden\'}`}>\n                  <HistoryPanel />\n                </div>\n                <div className={`${activeTab === \'orchestrator\' ? \'flex flex-col flex-1\' : \'hidden\'}`}>\n                  <ModelOrchestratorPanel />\n                </div>\n              </div>'
)

with open('/app/applet/src/playground/Playground.tsx', 'w') as f:
    f.write(content)

print("Patched!")
