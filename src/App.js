import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  Share2, 
  Search, 
  PlusCircle, 
  BarChart2, 
  Download, 
  Trash2,
  BookOpen
} from 'lucide-react';

// --- HELPER: WORD CLOUD LOGIC ---
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
  'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
  'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'things', 'hope'
]);

const generateWordCloudData = (entries) => {
  const wordMap = {};
  const allText = entries.map(e => `${e.past} ${e.future}`).join(' ').toLowerCase();
  const words = allText.replace(/[^\w\s]/g, '').split(/\s+/);

  words.forEach(word => {
    if (word && word.length > 2 && !STOP_WORDS.has(word)) {
      wordMap[word] = (wordMap[word] || 0) + 1;
    }
  });

  return Object.entries(wordMap)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 40); 
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [view, setView] = useState('entry'); // 'entry' | 'dashboard'
  const [entries, setEntries] = useState([]);
  
  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('journal_entries');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse entries", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('journal_entries', JSON.stringify(entries));
  }, [entries]);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: 5,
    moodLabel: '',
    past: '',
    future: '',
    reflection: ''
  });

  const defineWord = (word) => {
    if(!word) return;
    const url = `https://www.google.com/search?q=define+${word}`;
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    const textToShare = `My Reflection for ${formData.date}:\n\nPast: ${formData.past}\nFuture: ${formData.future}\nMood: ${formData.moodLabel} (${formData.mood}/10)`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Self-Reflection', text: textToShare });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(textToShare);
      alert("Copied to clipboard!");
    }
  };

  const handleSave = () => {
    if (!formData.moodLabel && !formData.reflection) {
      alert("Please enter at least a mood or a reflection.");
      return;
    }
    const newEntry = { ...formData, id: Date.now() };
    setEntries([...entries, newEntry]);
    alert("Journal Entry Saved.");
    setFormData({ ...formData, moodLabel: '', past: '', future: '', reflection: '' });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `journal_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearData = () => {
    if(window.confirm("Are you sure you want to delete all entries? This cannot be undone.")) {
      setEntries([]);
      localStorage.removeItem('journal_entries');
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-gray-800 pb-24">
      <div className="max-w-3xl mx-auto px-6 py-8">
        
        {/* VIEW: ENTRY FORM */}
        {view === 'entry' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-6">
              <h1 className="font-serif text-3xl tracking-widest text-white">SELF REFLECTION</h1>
              <span className="text-gray-500 text-sm tracking-widest">{formData.date}</span>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Select Date</label>
                {/* Fixed Date Input: color-scheme: dark ensures the calendar is visible */}
                <input 
                  type="date" 
                  value={formData.date}
                  style={{ colorScheme: 'dark' }} 
                  className="w-full bg-transparent border-b border-gray-700 text-white p-2 focus:outline-none focus:border-white transition-colors cursor-pointer"
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                  Mood Check-In <span className="text-white ml-2">{formData.mood}/10</span>
                </label>
                <input 
                  type="range" min="1" max="10" 
                  value={formData.mood} 
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-white mb-4"
                  onChange={(e) => setFormData({...formData, mood: parseInt(e.target.value)})}
                />
                
                <div className="flex gap-2">
                  <input 
                    placeholder="Name your feeling (e.g., Melancholy, Radiant)" 
                    className="flex-1 bg-transparent border-b border-gray-700 text-white p-2 focus:outline-none focus:border-white transition-colors placeholder-gray-600"
                    value={formData.moodLabel}
                    onChange={(e) => setFormData({...formData, moodLabel: e.target.value})}
                  />
                  <button 
                    onClick={() => defineWord(formData.moodLabel)}
                    className="flex items-center gap-1 px-3 py-1 border border-gray-700 rounded text-gray-400 hover:text-white hover:border-white transition-all text-xs uppercase tracking-wider"
                    disabled={!formData.moodLabel}
                  >
                    <Search size={14}/> Define
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-800 pb-8 mb-8">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-4">Past (Gratitude)</label>
                <textarea 
                  className="w-full bg-gray-900/50 border border-gray-800 rounded p-4 text-white focus:outline-none focus:border-gray-600 h-32 resize-none text-sm leading-relaxed"
                  placeholder="I am grateful for..."
                  value={formData.past}
                  onChange={(e) => setFormData({...formData, past: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-500 mb-4">Future (Hope)</label>
                <textarea 
                  className="w-full bg-gray-900/50 border border-gray-800 rounded p-4 text-white focus:outline-none focus:border-gray-600 h-32 resize-none text-sm leading-relaxed"
                  placeholder="Things I hope for..."
                  value={formData.future}
                  onChange={(e) => setFormData({...formData, future: e.target.value})}
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-xs uppercase tracking-widest text-gray-500 mb-4">Deep Reflection</label>
              <textarea 
                className="w-full bg-gray-900/50 border border-gray-800 rounded p-4 text-white focus:outline-none focus:border-gray-600 h-48 resize-none text-sm leading-relaxed font-serif"
                placeholder="Today I learned..."
                value={formData.reflection}
                onChange={(e) => setFormData({...formData, reflection: e.target.value})}
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleSave}
                className="flex-1 bg-white text-black font-bold py-3 px-6 rounded hover:bg-gray-200 transition-colors uppercase tracking-widest text-sm"
              >
                Save Entry
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center justify-center gap-2 bg-gray-900 text-white border border-gray-700 py-3 px-6 rounded hover:bg-gray-800 transition-colors uppercase tracking-widest text-sm"
              >
                <Share2 size={16}/> Share
              </button>
            </div>
          </div>
        )}

        {/* VIEW: DASHBOARD */}
        {view === 'dashboard' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-8">
              <h1 className="font-serif text-3xl tracking-widest text-white">INSIGHTS</h1>
              <div className="flex gap-2">
                <button onClick={handleExport} className="text-gray-400 hover:text-white p-2" title="Export JSON">
                  <Download size={20} />
                </button>
                <button onClick={handleClearData} className="text-red-900 hover:text-red-500 p-2" title="Clear All Data">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            
            {entries.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50"/>
                <p className="text-lg font-serif">Your journey begins with a single entry.</p>
                <p className="text-xs mt-2 uppercase tracking-widest">No data to display yet.</p>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-800">
                  <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-6">Mood Trajectory</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={entries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#444" 
                          tick={{fill: '#666', fontSize: 10}} 
                          tickFormatter={(value) => value.slice(5)} 
                        />
                        <YAxis stroke="#444" domain={[0, 10]} hide />
                        <Tooltip 
                          contentStyle={{backgroundColor: '#000', border: '1px solid #333', color: '#fff'}} 
                          itemStyle={{color: '#fff'}}
                          labelStyle={{color: '#888', marginBottom: '5px'}}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="mood" 
                          stroke="#ffffff" 
                          strokeWidth={2} 
                          dot={{fill: 'black', stroke: 'white', strokeWidth: 2, r: 4}} 
                          activeDot={{r: 6, fill: 'white'}}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Theme Cloud (Gratitude & Hope)</h3>
                  <div className="flex flex-wrap justify-center items-center gap-4 p-8 border border-gray-800 rounded-lg bg-gray-900/20 min-h-[200px]">
                    {generateWordCloudData(entries).length > 0 ? generateWordCloudData(entries).map((wordObj, index) => {
                      const size = Math.min(3, 0.8 + (wordObj.value * 0.15)) + 'rem';
                      const opacity = Math.min(1, 0.3 + (wordObj.value * 0.15));
                      return (
                        <span key={index} style={{ fontSize: size, opacity: opacity, transition: 'all 0.3s ease' }} className="font-serif text-white hover:text-blue-200 cursor-default">
                          {wordObj.text}
                        </span>
                      )
                    }) : <span className="text-gray-600 italic">Write more to see themes emerge...</span>}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-4">Recent Logs</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {entries.slice().reverse().slice(0, 4).map(e => (
                      <div key={e.id} className="border border-gray-800 p-4 rounded bg-gray-900/20 hover:border-gray-600 transition-colors">
                        <div className="text-xs text-gray-500 mb-1">{e.date}</div>
                        <div className="font-serif text-lg text-white mb-2">{e.moodLabel || "Untitled"}</div>
                        <div className="text-xs text-gray-400 line-clamp-2 italic">"{e.reflection.slice(0, 50)}..."</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* BOTTOM NAVIGATION */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-full px-8 py-4 flex gap-12 shadow-2xl z-50">
          <button 
            onClick={() => setView('entry')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'entry' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <PlusCircle size={24} />
            <span className="text-[10px] uppercase tracking-wider font-bold">New</span>
          </button>
          
          <button 
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center gap-1 transition-colors ${view === 'dashboard' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <BarChart2 size={24} />
            <span className="text-[10px] uppercase tracking-wider font-bold">Insights</span>
          </button>
        </div>
      </div>
    </div>
  );
}
