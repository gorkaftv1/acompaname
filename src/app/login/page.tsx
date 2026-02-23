import PageLayout from '@/components/PageLayout';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Iniciar Sesión - AcompañaMe',
  description: 'Únete a AcompañaMe y comienza tu camino',
};

export default function LoginPage() {
  return (
    <PageLayout className="bg-[#F5F3EF] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl">
        <LoginForm />
      </div>
    </PageLayout>
  );
}
