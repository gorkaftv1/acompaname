'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: 'green' | 'amber' | 'coral' | 'lavender';
  onClick?: () => void;
  href?: string;
}

const colorVariants = {
  green: {
    border: 'border-l-[#6B9E78]',
    iconBg: 'bg-[#6B9E78]/10',
    iconColor: 'text-[#6B9E78]',
    shadow: 'hover:shadow-[#6B9E78]/20',
  },
  amber: {
    border: 'border-l-[#E8B563]',
    iconBg: 'bg-[#E8B563]/10',
    iconColor: 'text-[#E8B563]',
    shadow: 'hover:shadow-[#E8B563]/20',
  },
  coral: {
    border: 'border-l-[#D99B7C]',
    iconBg: 'bg-[#D99B7C]/10',
    iconColor: 'text-[#D99B7C]',
    shadow: 'hover:shadow-[#D99B7C]/20',
  },
  lavender: {
    border: 'border-l-[#B4A5C7]',
    iconBg: 'bg-[#B4A5C7]/10',
    iconColor: 'text-[#B4A5C7]',
    shadow: 'hover:shadow-[#B4A5C7]/20',
  },
};

export default function QuickActionCard({
  title,
  description,
  icon: Icon,
  color,
  onClick,
  href,
}: QuickActionCardProps) {
  const colors = colorVariants[color];

  const cardContent = (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className={`h-full cursor-pointer border-l-4 ${colors.border} ${colors.shadow} hover:shadow-lg transition-shadow`}>
        <CardContent className="p-6">
          <div className={`w-12 h-12 ${colors.iconBg} rounded-full flex items-center justify-center mb-4`}>
            <Icon className={`w-6 h-6 ${colors.iconColor}`} />
          </div>
          <h3 className="font-bold text-lg text-[#2C5F7C] mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick} className="h-full">
        {cardContent}
      </div>
    );
  }

  return cardContent;
}
