import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Video, Users, MessageSquare, PenTool, Share2, Shield, Zap, Globe } from "lucide-react";
import heroImage from "@/assets/hero-collabify.jpg";

const Index = () => {
  const [roomCode, setRoomCode] = useState("");
  const [showJoinRoom, setShowJoinRoom] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="absolute inset-0 gradient-hero opacity-40"></div>
        <div className="relative z-10 container mx-auto px-6 pt-20 pb-32">
          <div className="text-center animate-fade-in">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Collaboration Simplified
            </Badge>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Collabify
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Real-time video conferencing, collaborative whiteboarding, and seamless file sharing. 
              All in one beautiful, secure platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button 
                size="lg" 
                className="gradient-primary text-white border-0 hover:scale-105 transition-all duration-300 shadow-lg"
                onClick={() => window.location.href = '/room/new'}
              >
                <Video className="w-5 h-5 mr-2" />
                Start New Room
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="glass border-white/20 hover:bg-white/10"
                onClick={() => setShowJoinRoom(true)}
              >
                <Users className="w-5 h-5 mr-2" />
                Join Room
              </Button>
            </div>

            {showJoinRoom && (
              <Card className="glass mt-8 mx-auto max-w-md animate-slide-up">
                <CardHeader>
                  <CardTitle>Join Room</CardTitle>
                  <CardDescription>Enter room code to join</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Room code (e.g., ABC-123)"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="bg-input border-border"
                  />
                  <Button 
                    className="w-full gradient-primary" 
                    disabled={!roomCode}
                    onClick={() => window.location.href = `/room/${roomCode}`}
                  >
                    Join Room
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything you need to collaborate</h2>
          <p className="text-xl text-muted-foreground">Professional-grade tools for modern teams</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Video,
              title: "HD Video Calls",
              description: "Crystal clear video with up to 6 participants in mesh network"
            },
            {
              icon: MessageSquare,
              title: "Real-time Chat",
              description: "Instant messaging with file sharing and emoji reactions"
            },
            {
              icon: PenTool,
              title: "Collaborative Whiteboard",
              description: "Draw, brainstorm, and visualize ideas together in real-time"
            },
            {
              icon: Share2,
              title: "Screen Sharing",
              description: "Share your screen for presentations and demos"
            },
            {
              icon: Shield,
              title: "Secure & Private",
              description: "End-to-end encryption and secure authentication"
            },
            {
              icon: Users,
              title: "Team Rooms",
              description: "Create persistent rooms for your team with custom settings"
            },
            {
              icon: Globe,
              title: "Cross-platform",
              description: "Works seamlessly across desktop, tablet, and mobile"
            },
            {
              icon: Zap,
              title: "Low Latency",
              description: "Optimized WebRTC for minimal delay and smooth experience"
            }
          ].map((feature, index) => (
            <Card key={index} className="glass hover:bg-card/80 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/20 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to start collaborating?</h2>
          <p className="text-xl text-muted-foreground mb-8">Join thousands of teams already using Collabify</p>
          <Button 
            size="lg" 
            className="gradient-primary text-white border-0 hover:scale-105 transition-all duration-300"
            onClick={() => window.location.href = '/auth/signup'}
          >
            Get Started Free
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;