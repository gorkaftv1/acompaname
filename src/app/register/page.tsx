import PageLayout from '@/components/PageLayout';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Crear Cuenta - AcompañaMe',
  description: 'Únete a AcompañaMe y comienza tu camino',
};

export default function RegisterPage() {
  return (
    <PageLayout className="bg-[#F5F3EF] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl">
        <RegisterForm />
      </div>
    </PageLayout>
  );
}
