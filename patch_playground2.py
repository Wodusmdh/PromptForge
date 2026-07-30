import sys

with open('/app/applet/src/playground/Playground.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'import { ModelOrchestratorPanel } from "../components/ModelOrchestratorPanel";',
    'import { ModelOrchestratorPanel } from "../components/ModelOrchestratorPanel";\nimport { GitHubWorkspace } from "../components/github/GitHubWorkspace";'
)

content = content.replace(
    'import { Menu, X, Hammer, BookOpen, Clock, Settings, PanelRightClose, PanelRightOpen, Terminal, Network } from "lucide-react";',
    'import { Menu, X, Hammer, BookOpen, Clock, Settings, PanelRightClose, PanelRightOpen, Terminal, Network, Github } from "lucide-react";'
)

content = content.replace(
    "useState<'editor' | 'rules' | 'history' | 'orchestrator'>('editor');",
    "useState<'editor' | 'rules' | 'history' | 'orchestrator' | 'github'>('editor');"
)

content = content.replace(
    '<NavItem \n              icon={<Network />} \n              label="Orchestrator" \n              active={activeTab === \'orchestrator\'} \n              onClick={() => { setActiveTab(\'orchestrator\'); setMobileMenuOpen(false); }} \n            />\n          </nav>',
    '<NavItem \n              icon={<Network />} \n              label="Orchestrator" \n              active={activeTab === \'orchestrator\'} \n              onClick={() => { setActiveTab(\'orchestrator\'); setMobileMenuOpen(false); }} \n            />\n            <NavItem \n              icon={<Github />} \n              label="GitHub" \n              active={activeTab === \'github\'} \n              onClick={() => { setActiveTab(\'github\'); setMobileMenuOpen(false); }} \n            />\n          </nav>'
)

content = content.replace(
    '<div className={`${activeTab === \'orchestrator\' ? \'flex flex-col flex-1\' : \'hidden\'}`}>\n                  <ModelOrchestratorPanel />\n                </div>\n              </div>',
    '<div className={`${activeTab === \'orchestrator\' ? \'flex flex-col flex-1\' : \'hidden\'}`}>\n                  <ModelOrchestratorPanel />\n                </div>\n                <div className={`${activeTab === \'github\' ? \'flex flex-col flex-1 h-full\' : \'hidden\'}`}>\n                  <GitHubWorkspace />\n                </div>\n              </div>'
)

with open('/app/applet/src/playground/Playground.tsx', 'w') as f:
    f.write(content)

print("Patched playground!")
