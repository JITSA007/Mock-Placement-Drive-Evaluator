import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  HelpCircle,
  Clock,
  Shuffle,
  X,
  Copy,
  BookOpen,
} from 'lucide-react';
import { GDTopic } from '../types';
import { GD_TOPICS } from '../data/sampleData';

interface GDRecommenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic?: (topic: GDTopic) => void;
}

export const GDRecommenderModal: React.FC<GDRecommenderModalProps> = ({
  isOpen,
  onClose,
  onSelectTopic,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<GDTopic>(GD_TOPICS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTopics = GD_TOPICS.filter((t) => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.context.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const rollRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * GD_TOPICS.length);
    setActiveTopic(GD_TOPICS[randomIndex]);
  };

  const copyTopicToClipboard = (topic: GDTopic) => {
    const text = `GD Topic: "${topic.title}"\n\nContext: ${topic.context}\n\nKey Points (For):\n${topic.keyArgumentsFor.map(p => `• ${p}`).join('\n')}\n\nKey Points (Against):\n${topic.keyArgumentsAgainst.map(p => `• ${p}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(topic.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Users size={24} className="text-purple-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold">Group Discussion (GD) Topics & Guidelines</h2>
                <span className="px-2 py-0.5 bg-purple-500/30 text-purple-200 border border-purple-400/30 text-[10px] rounded-full uppercase tracking-wider font-semibold">
                  PDF 50 Marks Rubric
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                Curated topical debriefs, balanced arguments, and evaluation cues for 20-minute GD rounds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Schedule & Guidelines Banner (From PDF Page 1) */}
        <div className="bg-purple-50/70 border-b border-purple-100 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-purple-900 gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 font-semibold">
              <Clock size={14} className="text-purple-600" />
              <span>Drive Format: 20 Mins / Group</span>
            </span>
            <span className="text-gray-400">|</span>
            <span>Batch Size: 8-10 Candidates</span>
            <span className="text-gray-400">|</span>
            <span className="font-semibold text-purple-700">Weightage: 50 Marks</span>
          </div>

          <button
            onClick={rollRandomTopic}
            className="px-3 py-1 bg-white border border-purple-300 hover:border-purple-500 rounded-lg text-purple-700 font-medium flex items-center space-x-1 shadow-sm transition-all hover:shadow"
          >
            <Shuffle size={13} />
            <span>Random Topic Generator</span>
          </button>
        </div>

        {/* Body Split View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Topics List */}
          <div className="w-full md:w-5/12 border-r border-gray-200 flex flex-col bg-gray-50/50">
            <div className="p-3 border-b border-gray-200 space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter topics..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div className="flex space-x-1 overflow-x-auto pb-1 text-[11px]">
                {['all', 'Tech & AI', 'Business & Industry', 'Social & Ethics', 'Career & Education'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-purple-700 text-white font-medium'
                        : 'bg-gray-200/80 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {cat === 'all' ? 'All Topics' : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => setActiveTopic(topic)}
                  className={`p-3 text-left cursor-pointer transition-colors ${
                    activeTopic?.id === topic.id
                      ? 'bg-purple-100/60 border-l-4 border-purple-700'
                      : 'hover:bg-gray-100/60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                      {topic.category}
                    </span>
                    <span className="text-[10px] text-gray-400">20 Mins</span>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-800 line-clamp-2">{topic.title}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Detailed Topic Guide */}
          <div className="w-full md:w-7/12 p-6 overflow-y-auto bg-white flex flex-col justify-between">
            {activeTopic && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                      {activeTopic.category}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyTopicToClipboard(activeTopic)}
                        className="p-1.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg text-xs flex items-center space-x-1"
                        title="Copy to clipboard"
                      >
                        {copiedId === activeTopic.id ? (
                          <CheckCircle size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                        <span>{copiedId === activeTopic.id ? 'Copied' : 'Copy'}</span>
                      </button>
                      {onSelectTopic && (
                        <button
                          onClick={() => {
                            onSelectTopic(activeTopic);
                            onClose();
                          }}
                          className="px-3 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-medium"
                        >
                          Use Topic
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug">{activeTopic.title}</h3>
                  <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <strong className="text-gray-800">Background Framing:</strong> {activeTopic.context}
                  </p>
                </div>

                {/* Pros and Cons Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-green-50/70 border border-green-200 rounded-xl space-y-2">
                    <h5 className="font-bold text-green-900 flex items-center space-x-1">
                      <CheckCircle size={14} className="text-green-600" />
                      <span>Supportive Arguments (For)</span>
                    </h5>
                    <ul className="space-y-1.5 text-[11px] text-green-800">
                      {activeTopic.keyArgumentsFor.map((arg, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-green-600 font-bold">•</span>
                          <span>{arg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                    <h5 className="font-bold text-amber-900 flex items-center space-x-1">
                      <HelpCircle size={14} className="text-amber-600" />
                      <span>Counter Perspectives (Against)</span>
                    </h5>
                    <ul className="space-y-1.5 text-[11px] text-amber-800">
                      {activeTopic.keyArgumentsAgainst.map((arg, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{arg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* What to Evaluate (Rubric alignment) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <BookOpen size={14} className="text-purple-600" />
                    <span>Evaluation Checklist (50 Marks Rubric)</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="p-2 bg-white rounded-lg border border-slate-100">
                      <strong>Content Knowledge (10M):</strong> Sound domain analogies and factual relevance.
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-100">
                      <strong>Communication Skills (10M):</strong> Concise phrasing without shouting or interrupting.
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-100">
                      <strong>Leadership / Initiative (10M):</strong> Opened debate, encouraged quiet peers, summarized.
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-100">
                      <strong>Teamwork & Body Language (20M):</strong> Calm eye contact, welcoming posture, respectful tone.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
