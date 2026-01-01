import FlowEditor from '@/components/flow/FlowEditor';
import ChatInterface from '@/components/chat/ChatInterface';

export default function Home() {
  return (
    <main className="flex h-screen w-screen overflow-hidden">
      {/* Canvas Area */}
      <div className="flex-1 h-full bg-slate-50">
        <FlowEditor />
      </div>

      {/* Chat Sidebar Area */}
      <div className="w-[400px] border-l bg-white flex flex-col shadow-xl z-10">
        <div className="p-4 border-b bg-slate-50">
          <h2 className="font-semibold text-lg">AI Copilot</h2>
          <p className="text-xs text-gray-500">Describe your agent flow</p>
        </div>
        <div className="flex-1 p-4 overflow-hidden">
           <ChatInterface />
        </div>
      </div>
    </main>
  );
}
