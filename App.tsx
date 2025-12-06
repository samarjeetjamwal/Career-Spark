import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  AppStep, 
  UserProfile, 
  AssessmentScores, 
  SkillSet, 
  AnalysisResult,
  ChatMessage 
} from './types';
import { INTEREST_QUESTIONS, SKILL_QUESTIONS, CORE_VALUES } from './constants';
import { generateCareerAnalysis, generateChatResponse } from './services/geminiService';
import { Button } from './components/Button';
import { StepWizard } from './components/StepWizard';
import { ProfileRadarChart } from './components/RadarChart';
import { 
  ArrowRight, 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  DollarSign, 
  TrendingUp, 
  Send,
  User,
  Bot
} from 'lucide-react';

const App = () => {
  // --- State Management ---
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  
  // Data State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    currentRole: '',
    motivation: '',
    dreamJob: ''
  });
  
  const [interestScores, setInterestScores] = useState<AssessmentScores>({
    realistic: 0,
    investigative: 0,
    artistic: 0,
    social: 0,
    enterprising: 0,
    conventional: 0
  });

  const [skillScores, setSkillScores] = useState<SkillSet>({
    communication: 3,
    leadership: 3,
    creativity: 3,
    analytical: 3,
    technical: 3
  });

  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  
  // Analysis State
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestRate = (category: string, value: number) => {
    setInterestScores(prev => ({ ...prev, [category.toLowerCase()]: value }));
  };

  const handleSkillRate = (id: string, value: number) => {
    setSkillScores(prev => ({ ...prev, [id]: value }));
  };

  const toggleValue = (val: string) => {
    if (selectedValues.includes(val)) {
      setSelectedValues(prev => prev.filter(v => v !== val));
    } else {
      if (selectedValues.length < 3) {
        setSelectedValues(prev => [...prev, val]);
      }
    }
  };

  const runAnalysis = async () => {
    setStep(AppStep.ANALYZING);
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await generateCareerAnalysis(
        userProfile,
        interestScores,
        skillScores,
        selectedValues
      );
      setAnalysis(result);
      setStep(AppStep.RESULTS);
      // Initialize chat with context
      setChatHistory([
        { 
          id: 'init', 
          role: 'model', 
          text: `Hi ${userProfile.name}! I've analyzed your profile. Feel free to ask me anything about these recommendations or how to get started!` 
        }
      ]);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while sparking your career options. Please try again.");
      setStep(AppStep.ASSESSMENT_VALUES); // Go back one step
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Construct history for Gemini
      // Provide system context in the first turn implicitly or rely on previous turns
      const historyForApi = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      
      // Add the user's latest message to the context sent to API
      // Note: The generateChatResponse implementation handles creating a chat session. 
      // Ideally we maintain a persistent chat object, but stateless is fine for this scope.
      
      const responseText = await generateChatResponse(historyForApi, userMsg.text);
      
      const botMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText || "I'm pondering that..." 
      };
      setChatHistory(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);


  // --- Render Steps ---

  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="bg-amber-100 p-6 rounded-full mb-8 animate-pulse">
        <Sparkles className="w-16 h-16 text-amber-600" />
      </div>
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
        Career <span className="text-amber-600">Spark</span>
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed">
        Ignite your professional journey with AI-powered guidance. 
        Discover paths that align with your unique personality, skills, and dreams.
      </p>
      <Button size="lg" onClick={() => setStep(AppStep.PROFILING)}>
        Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  );

  const renderProfiling = () => (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Let's get to know you</h2>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">What's your name?</label>
          <input
            type="text"
            name="name"
            value={userProfile.name}
            onChange={handleProfileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
            placeholder="Alex Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Status / Role</label>
          <input
            type="text"
            name="currentRole"
            value={userProfile.currentRole}
            onChange={handleProfileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
            placeholder="e.g. Student, Marketing Assistant, Unemployed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">What brings you here today?</label>
          <textarea
            name="motivation"
            value={userProfile.motivation}
            onChange={handleProfileChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
            placeholder="e.g. I'm feeling stuck, looking for a career change..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dream Job (Optional)</label>
          <input
            type="text"
            name="dreamJob"
            value={userProfile.dreamJob}
            onChange={handleProfileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
            placeholder="If money wasn't an issue..."
          />
        </div>
        <div className="pt-4 flex justify-end">
          <Button 
            onClick={() => setStep(AppStep.ASSESSMENT_INTERESTS)}
            disabled={!userProfile.name || !userProfile.currentRole}
          >
            Next: Interests
          </Button>
        </div>
      </div>
    </div>
  );

  const renderInterests = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">What sparks your interest?</h2>
        <p className="text-gray-600 mt-2">Rate how much you resonate with these statements (1 = Not at all, 5 = Totally me)</p>
      </div>
      <div className="grid gap-6">
        {INTEREST_QUESTIONS.map((q) => (
          <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                <q.icon size={24} />
              </div>
              <p className="font-medium text-gray-700">{q.question}</p>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleInterestRate(q.category, rating)}
                  className={`w-10 h-10 rounded-full font-medium transition-all ${
                    interestScores[q.category.toLowerCase()] === rating 
                      ? 'bg-amber-500 text-white scale-110 shadow-lg' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={() => setStep(AppStep.PROFILING)}>Back</Button>
        <Button 
          onClick={() => setStep(AppStep.ASSESSMENT_SKILLS)}
          disabled={Object.values(interestScores).some(v => v === 0)}
        >
          Next: Skills
        </Button>
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Assess Your Superpowers</h2>
        <p className="text-gray-600 mt-2">How confident are you in these areas?</p>
      </div>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-8">
        {SKILL_QUESTIONS.map((s) => (
          <div key={s.id}>
            <div className="flex justify-between mb-2">
              <label className="font-medium text-gray-700">{s.label}</label>
              <span className="text-amber-600 font-bold">{skillScores[s.id]}/5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={skillScores[s.id]}
              onChange={(e) => handleSkillRate(s.id, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>
        ))}
      </div>
      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={() => setStep(AppStep.ASSESSMENT_INTERESTS)}>Back</Button>
        <Button onClick={() => setStep(AppStep.ASSESSMENT_VALUES)}>Next: Values</Button>
      </div>
    </div>
  );

  const renderValues = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">What matters most?</h2>
        <p className="text-gray-600 mt-2">Select your top 3 priorities for a fulfilling career.</p>
      </div>
      <div className="flex flex-wrap gap-3 justify-center mb-10">
        {CORE_VALUES.map((val) => {
          const isSelected = selectedValues.includes(val);
          return (
            <button
              key={val}
              onClick={() => toggleValue(val)}
              className={`px-6 py-3 rounded-full border-2 text-sm font-medium transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-md'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              } ${(!isSelected && selectedValues.length >= 3) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isSelected && selectedValues.length >= 3}
            >
              {val}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => setStep(AppStep.ASSESSMENT_SKILLS)}>Back</Button>
        <div className="text-sm text-gray-400">
          {selectedValues.length} / 3 selected
        </div>
        <Button 
          onClick={runAnalysis} 
          disabled={selectedValues.length === 0}
          variant="secondary"
        >
          Spark Analysis
        </Button>
      </div>
    </div>
  );

  const renderAnalyzing = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
        <Sparkles className="absolute inset-0 m-auto text-amber-500 animate-pulse" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">Analyzing your profile...</h3>
      <p className="text-gray-500">Connecting the dots between your interests, skills, and dreams.</p>
    </div>
  );

  const renderResults = () => {
    if (!analysis) return null;

    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
              {analysis.personalityType}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Career Spark Profile</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {analysis.summary}
            </p>
          </div>
          <div className="w-full md:w-1/3 flex flex-col items-center bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Interest Profile</h4>
            <ProfileRadarChart data={interestScores} />
          </div>
        </div>

        {/* Career Cards */}
        <h3 className="text-2xl font-bold text-gray-800 px-2">Top Recommendations</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analysis.recommendations.map((career, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xl font-bold text-gray-900">{career.title}</h4>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">
                    {career.matchPercentage}% Match
                  </span>
                </div>
                <p className="text-gray-600 mb-4 text-sm line-clamp-3">{career.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <DollarSign size={16} className="mr-2 text-gray-400" />
                    {career.salaryRange}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <GraduationCap size={16} className="mr-2 text-gray-400" />
                    {career.educationPath}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <TrendingUp size={16} className="mr-2 text-gray-400" />
                    {career.nextSteps[0]}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase">Pros</div>
                  <div className="flex flex-wrap gap-2">
                    {career.pros.slice(0, 2).map((pro, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs">{pro}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 border-t border-gray-100">
                <button 
                  onClick={() => {
                    setChatInput(`Tell me more about being a ${career.title}. What is a typical day like?`);
                    setStep(AppStep.CHAT);
                  }}
                  className="w-full text-center text-amber-600 font-medium text-sm hover:text-amber-700"
                >
                  Ask Spark about this role &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-8">
           <Button variant="secondary" size="lg" onClick={() => setStep(AppStep.CHAT)}>
              Chat with Career Spark
           </Button>
        </div>
      </div>
    );
  };

  const renderChat = () => (
    <div className="max-w-4xl mx-auto h-[70vh] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-bold">Career Spark Assistant</h3>
        </div>
        <button 
          onClick={() => setStep(AppStep.RESULTS)} 
          className="text-xs bg-indigo-500 hover:bg-indigo-400 px-3 py-1 rounded"
        >
          View Dashboard
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {chatHistory.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-amber-100' : 'bg-indigo-100'}`}>
                {msg.role === 'user' ? <User size={16} className="text-amber-600" /> : <Bot size={16} className="text-indigo-600" />}
              </div>
              <div 
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-amber-500 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isChatLoading && (
           <div className="flex justify-start">
             <div className="flex max-w-[80%] gap-3">
               <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                 <Bot size={16} className="text-indigo-600" />
               </div>
               <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1">
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                 <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
               </div>
             </div>
           </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-3">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask follow-up questions..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <Button type="submit" variant="secondary" disabled={!chatInput.trim() || isChatLoading}>
          <Send size={18} />
        </Button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen pb-10">
       <nav className="w-full bg-white border-b border-gray-100 px-6 py-4 mb-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl text-gray-900 cursor-pointer" onClick={() => { if(step !== AppStep.WELCOME) setStep(AppStep.WELCOME) }}>
            <div className="bg-gradient-to-br from-amber-400 to-orange-600 w-8 h-8 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <span>Career Spark</span>
          </div>
          {step !== AppStep.WELCOME && (
             <div className="text-sm text-gray-500 hidden sm:block">
               Igniting your future, {userProfile.name || 'Friend'}
             </div>
          )}
        </div>
      </nav>

      {step !== AppStep.WELCOME && step !== AppStep.RESULTS && step !== AppStep.CHAT && (
        <StepWizard currentStep={step} />
      )}

      <main className="container mx-auto px-4">
        {step === AppStep.WELCOME && renderWelcome()}
        {step === AppStep.PROFILING && renderProfiling()}
        {step === AppStep.ASSESSMENT_INTERESTS && renderInterests()}
        {step === AppStep.ASSESSMENT_SKILLS && renderSkills()}
        {step === AppStep.ASSESSMENT_VALUES && renderValues()}
        {step === AppStep.ANALYZING && renderAnalyzing()}
        {step === AppStep.RESULTS && renderResults()}
        {step === AppStep.CHAT && renderChat()}
        
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg max-w-md animate-slide-up">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            <button onClick={() => setError(null)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
