import { useClerk } from '@clerk/clerk-react';
import { Heading, Text, Button, GlassCard } from '@/lib';
import { ArrowRight, Mic, Zap, Shield } from 'lucide-react';
import { TeamSection } from '@/components/sections/TeamSection';

export function WelcomePage() {
  const { openSignIn } = useClerk();

  const handleGetStarted = () => {
    openSignIn({
      afterSignInUrl: '/',
      afterSignUpUrl: '/',
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden selection:bg-primary/30">
      {/* Decorative Orbs & Mesh Gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[100px] pointer-events-none animate-[pulse_10s_ease-in-out_infinite_reverse]" />
      <div className="fixed top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-blue-400/10 blur-[80px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4">
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="flex flex-col items-center">
            <GlassCard variant="glow" className="mb-8 rounded-full px-4 py-1.5 border-primary/30">
              <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                ✨ Introducing Liquid Glass Design
              </span>
            </GlassCard>

            <Heading level="h1" className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                Transcribe & Summarize
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
                In Seconds
              </span>
            </Heading>
            
            <Text variant="body" color="secondary" className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed text-slate-400">
              Transform your meetings, lectures, and interviews into actionable insights with our secure, client-side AI transcription.
            </Text>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full sm:w-auto">
              <Button 
                variant="large" 
                onClick={handleGetStarted} 
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/25 min-w-[200px] border-0"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 transform skew-y-12" />
              </Button>
              
              <Button 
                variant="outline" 
                className="px-8 py-4 text-lg min-w-[200px] border-white/10 hover:bg-white/5 backdrop-blur-sm transition-all hover:border-white/20 text-slate-300" 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Features
              </Button>
            </div>

            {/* Floating UI Mockup/Preview could go here */}
            <div className="mt-20 w-full max-w-4xl mx-auto opacity-90 hover:opacity-100 transition-opacity duration-700 delay-200">
              <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/20 bg-slate-900/50 backdrop-blur-sm aspect-video group">
                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-slate-500 font-mono text-sm">[App Preview Visualization]</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
             <Heading level="h2" className="text-3xl md:text-4xl font-bold mb-4 text-white">Power Tools for Audio</Heading>
             <p className="text-slate-400 text-lg">Everything you need to master your recordings.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Mic className="w-8 h-8 text-blue-400" />}
              title="Crystal Clear Transcription"
              description="Upload files or record directly. Accurate transcription for reliable records using advanced on-device processing."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-amber-400" />}
              title="Instant AI Summaries"
              description="Get key points, action items, and structured summaries automatically generated by top-tier AI models."
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-emerald-400" />}
              title="Private & Secure"
              description="Your data stays yours. Client-side processing ensures maximum privacy. No audio leaves your device without permission."
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <TeamSection />

      {/* CTA Section */}
      <section className="py-32 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/20 pointer-events-none" />
        <div className="container mx-auto max-w-3xl relative z-10">
          <GlassCard variant="glow" className="p-12 md:p-16 border-white/10">
            <Heading level="h2" className="mb-6 text-4xl font-bold text-white">Ready to transform your workflow?</Heading>
            <Text variant="body" className="mb-10 text-xl text-slate-300 max-w-xl mx-auto">
              Join thousands of users who are saving hours every week with Trammarise.
            </Text>
            <Button 
                variant="large" 
                onClick={handleGetStarted}
                className="w-full sm:w-auto bg-white text-blue-900 hover:bg-slate-100 border-0 shadow-xl shadow-white/10"
            >
              Start for Free
            </Button>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-slate-950/30 backdrop-blur-lg">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Trammarise. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Terms</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <GlassCard variant="dark" className="p-8 h-full hover:bg-slate-800/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/20 border-white/5 group">
      <div className="mb-6 p-4 bg-slate-900/50 rounded-2xl w-fit border border-white/5 group-hover:border-white/10 transition-colors">{icon}</div>
      <Heading level="h3" className="mb-4 text-xl font-semibold text-white group-hover:text-blue-200 transition-colors">{title}</Heading>
      <Text variant="body" className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{description}</Text>
    </GlassCard>
  );
}
