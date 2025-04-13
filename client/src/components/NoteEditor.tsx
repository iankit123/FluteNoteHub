import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTimestampInSeconds } from '@/lib/utils';
import { Note } from '@shared/schema';
import { X, Save } from 'lucide-react';

interface NoteEditorProps {
  note?: Note;
  tutorialId?: number;
  onSave: (note: { title: string, content: string, tutorialId?: number }) => void;
  onCancel: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, tutorialId, onSave, onCancel }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [activeTab, setActiveTab] = useState<string>('editor');
  
  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a title for your note.",
        variant: "destructive"
      });
      return;
    }
    
    onSave({
      title,
      content,
      tutorialId: note?.tutorialId || tutorialId,
    });
  };
  
  // Simple markdown-like parser for rendering
  const renderFormattedContent = (text: string) => {
    if (!text) return <p>No content yet.</p>;
    
    const lines = text.split('\n');
    
    return (
      <div className="space-y-5 text-dark-slate/80">
        {lines.map((line, index) => {
          if (line.startsWith('# ')) {
            // Heading 1
            return <h1 key={index} className="font-poppins font-bold text-2xl text-dark-slate">{line.substring(2)}</h1>;
          } else if (line.startsWith('## ')) {
            // Heading 2
            return <h2 key={index} className="font-poppins font-semibold text-xl text-dark-slate mt-8 mb-3">{line.substring(3)}</h2>;
          } else if (line.startsWith('> ')) {
            // Practice Tip / Callout
            return (
              <div key={index} className="bg-turmeric-yellow/20 px-4 py-3 rounded-lg border-l-4 border-turmeric-yellow">
                <p className="font-poppins font-medium text-dark-slate">Practice Tip:</p>
                <p>{line.substring(2)}</p>
              </div>
            );
          } else if (line.startsWith('- ')) {
            // List item
            return (
              <div key={index} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-royal-purple" />
                <p>{line.substring(2)}</p>
              </div>
            );
          } else if (line.match(/^\[\d+:\d+\]/)) {
            // Timestamp
            const timestampMatch = line.match(/^\[(\d+:\d+(?:\.\d+)?)\]/);
            if (timestampMatch) {
              const timestamp = timestampMatch[0];
              const text = line.substring(timestamp.length).trim();
              
              return (
                <div key={index} className="flex">
                  <span className="bg-royal-purple/10 text-royal-purple font-medium px-2 py-1 rounded mr-3 h-min whitespace-nowrap">
                    {timestampMatch[1]}
                  </span>
                  <div>
                    <p className="font-medium text-dark-slate">{text}</p>
                  </div>
                </div>
              );
            }
          }
          
          // Default paragraph
          return <p key={index}>{line}</p>;
        })}
      </div>
    );
  };
  
  return (
    <div className="bg-dark-slate/95 fixed inset-0 z-50 flex flex-col">
      <div className="nav-gradient p-4 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={onCancel}
            className="text-ivory-white mr-4"
          >
            <X className="h-6 w-6" />
          </button>
          <h2 className="font-poppins font-semibold text-lg text-ivory-white">
            {note ? 'Edit Note' : 'New Note'}
          </h2>
        </div>
        <div className="flex space-x-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[200px]">
            <TabsList className="bg-deep-teal/50">
              <TabsTrigger 
                value="editor" 
                className="data-[state=active]:bg-deep-teal data-[state=active]:text-ivory-white text-ivory-white/80"
              >
                Editor
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="data-[state=active]:bg-deep-teal data-[state=active]:text-ivory-white text-ivory-white/80"
              >
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            onClick={handleSave}
            className="bg-coral-pink hover:bg-coral-pink/90 text-ivory-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Editor Panel */}
        <div className={`flex-1 bg-[#1E1E2F] p-4 overflow-auto ${activeTab === 'editor' ? 'block' : 'hidden md:block'}`}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="w-full bg-[#292A43] rounded-lg p-3 mb-4 font-poppins text-xl text-ivory-white/90 border-none focus:outline-none focus:ring-2 focus:ring-royal-purple"
          />
          <div className="bg-[#292A43] rounded-lg p-4 font-mono text-sm text-ivory-white/90 h-full">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Start writing your note here...\n\n# Use markdown-like formatting:\n\n[1:22] Timestamp notes\n\n## Section headings\n\n> Practice tips in blockquotes\n\n- List items`}
              className="w-full h-[calc(100vh-250px)] bg-transparent border-none resize-none focus:outline-none"
            />
          </div>
        </div>
        
        {/* Preview Panel */}
        <div className={`flex-1 bg-ivory-white p-4 overflow-auto ${activeTab === 'preview' ? 'block' : 'hidden md:block'}`}>
          <div className="max-w-2xl mx-auto">
            <h1 className="font-poppins font-bold text-2xl text-dark-slate mb-6">
              {title || 'Untitled Note'}
            </h1>
            
            {content.includes('https://youtube.com') || content.includes('https://youtu.be') ? (
              <div className="bg-royal-purple/10 rounded-lg p-3 mb-6 flex items-center">
                <svg className="h-6 w-6 text-royal-purple mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
                <a href="#" className="text-royal-purple hover:underline">
                  {content.split('\n').find(line => line.includes('https://youtube.com') || line.includes('https://youtu.be'))}
                </a>
              </div>
            ) : null}
            
            {renderFormattedContent(content)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
