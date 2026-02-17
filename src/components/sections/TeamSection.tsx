import { GlassCard, Heading, Text, Badge } from '@/lib';
import { Github, Linkedin, Twitter } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  color: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Alex Chen',
    role: 'Lead Engineer',
    bio: 'Building the future of audio AI with passion and precision.',
    initials: 'AC',
    color: 'bg-blue-500',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'Product Designer',
    bio: 'Crafting intuitive and beautiful experiences for every user.',
    initials: 'SJ',
    color: 'bg-purple-500',
  },
  {
    id: '3',
    name: 'Michael Brown',
    role: 'AI Researcher',
    bio: 'Pushing the boundaries of machine learning and maximizing performance.',
    initials: 'MB',
    color: 'bg-green-500',
  },
  {
    id: '4',
    name: 'Emily Davis',
    role: 'Frontend Developer',
    bio: 'Creating seamless, responsive, and accessible user interfaces.',
    initials: 'ED',
    color: 'bg-orange-500',
  },
];

export function TeamSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-primary/5 via-transparent to-primary/5 blur-3xl -z-10 rounded-full opacity-50" />

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Our Team
          </Badge>
          <Heading level="h2" className="mb-4 bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-secondary">
            Meet the Minds Behind Trammarise
          </Heading>
          <Text variant="body" color="secondary" className="max-w-2xl mx-auto">
            We are a passionate group of engineers, designers, and researchers dedicated to making audio transcription accessible and powerful for everyone.
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM_MEMBERS.map((member) => (
            <div key={member.id} className="h-full">
              <GlassCard
                variant="light"
                className="h-full p-6 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 border-white/10 dark:border-white/5"
              >
                <div className={`w-20 h-20 rounded-full ${member.color} flex items-center justify-center mb-6 shadow-lg ring-4 ring-white/10`}>
                  <span className="text-2xl font-bold text-white">{member.initials}</span>
                </div>
                
                <Heading level="h3" className="mb-1">
                  {member.name}
                </Heading>
                
                <Text variant="small" className="text-primary mb-4 font-medium">
                  {member.role}
                </Text>
                
                <Text variant="small" color="secondary" className="mb-6 flex-grow">
                  {member.bio}
                </Text>
                
                <div className="flex gap-3 mt-auto">
                  <a href="#" className="p-2 rounded-full hover:bg-white/10 text-text-tertiary hover:text-text-primary transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                  <a href="#" className="p-2 rounded-full hover:bg-white/10 text-text-tertiary hover:text-text-primary transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="#" className="p-2 rounded-full hover:bg-white/10 text-text-tertiary hover:text-text-primary transition-colors">
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
