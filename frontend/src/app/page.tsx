// /frontend/src/app/page.tsx
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { BookOpen, Users, GraduationCap, Shield, BarChart3, Calendar } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Mokymosi valdymas',
      description: 'Sekite studentų progresą ir mokymosi rezultatus',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Vartotojų valdymas',
      description: 'Valdykite studentus, tėvus, kuratorius ir mentorius',
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: 'Dalykų ir lygių valdymas',
      description: 'Organizuokite dalykus ir mokymosi lygius',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Saugumas',
      description: 'Saugūs prisijungimai ir duomenų apsauga',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Ataskaitos',
      description: 'Gaukite detales ataskaitas apie progresą',
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Planavimas',
      description: 'Planuokite mokymosi procesą ir veiklą',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            A-DIENYNAS
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Moderni studentų dienynas ir mokymosi valdymo sistema, 
            skirta efektyviam mokymosi procesui organizuoti ir sekti.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg">
                Prisijungti
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sistemos galimybės
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A-DIENYNAS suteikia visapusiškas galimybes mokymosi procesui valdyti 
              ir sekti studentų progresą.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 rounded-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pradėkite naudoti A-DIENYNAS šiandien
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Prisijunkite prie modernios mokymosi valdymo sistemos ir 
            pagerinkite savo mokymosi procesą.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button variant="secondary" size="lg">
                Prisijungti
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
