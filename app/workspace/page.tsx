'use client';

import React, { useState } from 'react';
import {
  BsActivity,
  BsCalendar,
  BsCheckSquare,
  BsClock,
  BsGrid,
  BsX,
  BsBarChart,
  BsStar,
  BsCheckCircle,
  BsExclamationTriangle,
} from 'react-icons/bs';
import {
  FiMessageSquare,
  FiUsers,
  FiTrendingUp,
  FiClock,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PenBox, Target, AlertCircle } from 'lucide-react';
import KanbanBoard from './components/KanbanBoard';
import TaskBoard from './components/TaskBoard';
import { useSession } from 'next-auth/react';
import ScheduleBoard from './components/ScheduleBoard';
import CollaborativeBoard from './components/CollaborativeBoard';

interface CustomCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const CustomCard = ({ children, className = '', onClick }: CustomCardProps) => (
  <div
    className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const Workspace = () => {
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const session = useSession();

  const features = [
    {
      id: 'kanban',
      title: 'Kanban Board',
      description: 'Track progress visually',
      icon: <BsGrid className="h-6 w-6 text-blue-600" />,
      bgColor: 'bg-blue-50',
      content: <KanbanBoard />,
    },
    {
      id: 'tasks',
      title: 'Task Management',
      description: 'Organize and prioritize work',
      icon: <BsCheckSquare className="h-6 w-6 text-green-600" />,
      bgColor: 'bg-green-50',
      content: <TaskBoard />,
    },
    {
      id: 'calendar',
      title: 'Calendar & Meetings',
      description: 'Coordinate team schedules',
      icon: <BsCalendar className="h-6 w-6 text-orange-600" />,
      bgColor: 'bg-orange-50',
      content: <ScheduleBoard />,
    },
    {
      id: 'whiteboard',
      title: 'Whiteboard',
      description: 'Virtual Whiteboard',
      icon: <PenBox className="h-6 w-6 text-purple-600" />,
      bgColor: 'bg-purple-50',
      content: <CollaborativeBoard />,
    },
  ];

  const quickStats = [
    {
      title: 'Active Tasks',
      value: '12',
      change: '+2',
      icon: <BsActivity className="h-6 w-6 text-red-600" />,
      bgColor: 'bg-red-50',
    },
    {
      title: 'Upcoming Meetings',
      value: '4',
      change: 'Upcoming',
      icon: <BsClock className="h-6 w-6 text-blue-600" />,
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Project Progress',
      value: '68%',
      change: '+5%',
      icon: <FiTrendingUp className="h-6 w-6 text-green-600" />,
      bgColor: 'bg-green-50',
    },
    {
      title: 'Team Performance',
      value: '92',
      change: 'Excellent',
      icon: <BsBarChart className="h-6 w-6 text-purple-600" />,
      bgColor: 'bg-purple-50',
    },
  ];

  const productivityData = [
    { name: 'Mon', value: 65 },
    { name: 'Tue', value: 72 },
    { name: 'Wed', value: 68 },
    { name: 'Thu', value: 85 },
    { name: 'Fri', value: 78 },
  ];

  const taskBreakdown = [
    { status: 'Completed', count: 24, color: 'bg-green-100 text-green-600' },
    { status: 'In Progress', count: 15, color: 'bg-blue-100 text-blue-600' },
    { status: 'Blocked', count: 3, color: 'bg-red-100 text-red-600' },
    { status: 'Review', count: 8, color: 'bg-orange-100 text-orange-600' },
  ];

  const upcomingDeadlines = [
    {
      task: 'Project Presentation',
      date: 'Tomorrow, 2:00 PM',
      priority: 'High',
    },
    { task: 'Client Meeting', date: 'Today, 4:30 PM', priority: 'Medium' },
    { task: 'Design Review', date: 'Friday, 11:00 AM', priority: 'Low' },
  ];

  if (expandedFeature) {
    const feature = features.find((f) => f.id === expandedFeature);
    if (!feature) return null;

    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            {feature.icon}
            <h2 className="text-2xl font-bold">{feature.title}</h2>
          </div>
          <button
            onClick={() => setExpandedFeature(null)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <BsX className="h-6 w-6" />
          </button>
        </div>
        {feature.content}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {session.data?.user?.name}&apos;s Workspace
          </h1>
          <p className="text-sm text-gray-600">Last updated: Just now</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <FiUsers className="h-4 w-4" />
            <span className="text-sm font-medium">Share</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg">
            <BsStar className="h-4 w-4" />
            <span className="text-sm font-medium">Private</span>
          </div>
        </div>
      </div>

      {/* Primary Action Cards - Most Important Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => (
          <CustomCard
            key={feature.id}
            className="cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-200"
            onClick={() => setExpandedFeature(feature.id)}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-xl ${feature.bgColor}`}>
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {feature.description}
                </p>
              </div>
            </div>
          </CustomCard>
        ))}
      </div>

      {/* Critical Metrics & Alerts */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Column - Priority Information */}
        <div className="lg:w-2/3 space-y-4">
          {/* Upcoming Deadlines - Most Time-Sensitive */}
          <CustomCard>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Priority Items
                </h3>
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {upcomingDeadlines.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          item.priority === 'High'
                            ? 'bg-red-100'
                            : item.priority === 'Medium'
                            ? 'bg-orange-100'
                            : 'bg-green-100'
                        }`}
                      >
                        <FiClock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{item.task}</p>
                        <p className="text-sm text-gray-500">{item.date}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.priority === 'High'
                          ? 'bg-red-100 text-red-700'
                          : item.priority === 'Medium'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CustomCard>

          {/* Quick Stats - Important Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <CustomCard
                key={index}
                className="hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      {stat.icon}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        stat.change.includes('+')
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
                </div>
              </CustomCard>
            ))}
          </div>
        </div>

        {/* Right Column - Progress & Status */}
        <div className="lg:w-1/3 space-y-4">
          {/* Task Status Overview */}
          <CustomCard>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Status</h3>
              <div className="space-y-3">
                {taskBreakdown.map((item, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded-md ${item.color}`}>
                          <BsCheckCircle className="h-3 w-3" />
                        </div>
                        <span className="text-sm font-medium">
                          {item.status}
                        </span>
                      </div>
                      <span className="text-sm font-semibold">
                        {item.count}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          item.color.includes('green')
                            ? 'bg-green-500'
                            : item.color.includes('blue')
                            ? 'bg-blue-500'
                            : item.color.includes('red')
                            ? 'bg-red-500'
                            : 'bg-orange-500'
                        }`}
                        style={{ width: `${(item.count / 50) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CustomCard>

          {/* Team Goals */}
          <CustomCard>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Team Progress</h3>
                <Target className="h-5 w-5 text-gray-500" />
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Sprint Progress', value: 75, color: 'bg-blue-500' },
                  { label: 'Bug Resolution', value: 60, color: 'bg-green-500' },
                  {
                    label: 'Customer Satisfaction',
                    value: 90,
                    color: 'bg-purple-500',
                  },
                ].map((goal, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{goal.label}</span>
                      <span className="font-medium">{goal.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-2 ${goal.color} rounded-full transition-all group-hover:opacity-80`}
                        style={{ width: `${goal.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CustomCard>
        </div>
      </div>

      {/* Activity Trends */}
      <CustomCard>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Productivity Trend</h3>
            <select className="text-sm border rounded-lg px-3 py-1.5 bg-gray-50">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Quarter</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivityData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={{ fill: '#4F46E5' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CustomCard>
    </div>
  );
};

export default Workspace;
