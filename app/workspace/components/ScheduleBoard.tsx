import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MoreVertical,
  Plus,
  Calendar,
  Clock,
  Users,
  Video,
  MapPin,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  isRecurring: boolean;
  recurrencePattern?: string;
  location: string;
  isVirtual: boolean;
  meetingLink?: string;
  reminder: number;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  createdBy: string;
}

const ScheduleBoard = () => {
  const { data: session } = useSession();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    attendees: [] as string[],
    isRecurring: false,
    location: '',
    isVirtual: false,
    meetingLink: '',
    reminder: 15,
    priority: 'medium' as 'low' | 'medium' | 'high',
    notes: '',
  });

  useEffect(() => {
    const storedMeetings = localStorage.getItem('schedule-meetings');
    if (storedMeetings) {
      setMeetings(JSON.parse(storedMeetings));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('schedule-meetings', JSON.stringify(meetings));
  }, [meetings]);

  const addMeeting = () => {
    if (!session?.user?.name) {
      alert('You must be logged in to schedule meetings.');
      return;
    }

    const meeting: Meeting = {
      id: uuidv4(),
      ...newMeeting,
      createdBy: session.user.name,
    };

    setMeetings([...meetings, meeting]);
    setNewMeeting({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      attendees: [],
      isRecurring: false,
      location: '',
      isVirtual: false,
      meetingLink: '',
      reminder: 15,
      priority: 'medium',
      notes: '',
    });
    setIsNewMeetingOpen(false);
  };

  const deleteMeeting = (meetingId: string) => {
    setMeetings(meetings.filter((meeting) => meeting.id !== meetingId));
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 20; i++) {
      slots.push(`${i}:00`);
      slots.push(`${i}:30`);
    }
    return slots;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysInWeek = () => {
    const days = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('day')}
              className={viewMode === 'day' ? 'bg-orange-100' : ''}
            >
              Day
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('week')}
              className={viewMode === 'week' ? 'bg-orange-100' : ''}
            >
              Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('month')}
              className={viewMode === 'month' ? 'bg-orange-100' : ''}
            >
              Month
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white rounded-lg border px-3 py-2">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search meetings..."
              className="border-none focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            onClick={() => setIsNewMeetingOpen(true)}
            className="bg-orange-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() - 7);
                setSelectedDate(newDate);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {selectedDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() + 7);
                setSelectedDate(newDate);
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <select
            className="border rounded-md p-2"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {getDaysInWeek().map((day) => (
              <div key={day.toISOString()} className="border rounded-lg p-2">
                <div className="text-sm font-medium mb-2">
                  {day.toLocaleDateString('en-US', {
                    weekday: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="space-y-2">
                  {meetings
                    .filter((meeting) => {
                      const meetingDate = new Date(meeting.date);
                      return (
                        meetingDate.toDateString() === day.toDateString() &&
                        (filterPriority === 'all' ||
                          meeting.priority === filterPriority) &&
                        (meeting.title
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                          meeting.description
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()))
                      );
                    })
                    .map((meeting) => (
                      <Card key={meeting.id} className="p-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-sm">
                              {meeting.title}
                            </h3>
                            <div className="text-xs text-gray-500">
                              {meeting.startTime} - {meeting.endTime}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteMeeting(meeting.id)}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                              meeting.priority
                            )}`}
                          >
                            {meeting.priority}
                          </span>
                          {meeting.isVirtual && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
                              <Video className="w-3 h-3 mr-1" />
                              Virtual
                            </span>
                          )}
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Meeting Dialog */}
      <Dialog open={isNewMeetingOpen} onOpenChange={setIsNewMeetingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule New Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Meeting title"
              value={newMeeting.title}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, title: e.target.value })
              }
            />
            <Textarea
              placeholder="Meeting description"
              value={newMeeting.description}
              onChange={(e) =>
                setNewMeeting({ ...newMeeting, description: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={newMeeting.date}
                onChange={(e) =>
                  setNewMeeting({ ...newMeeting, date: e.target.value })
                }
              />
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={newMeeting.startTime}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, startTime: e.target.value })
                  }
                />
                <Input
                  type="time"
                  value={newMeeting.endTime}
                  onChange={(e) =>
                    setNewMeeting({ ...newMeeting, endTime: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Priority
                </label>
                <select
                  className="w-full border rounded-md p-2"
                  value={newMeeting.priority}
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      priority: e.target.value as 'low' | 'medium' | 'high',
                    })
                  }
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Reminder
                </label>
                <select
                  className="w-full border rounded-md p-2"
                  value={newMeeting.reminder}
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      reminder: parseInt(e.target.value),
                    })
                  }
                >
                  <option value="5">5 minutes before</option>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isVirtual"
                  checked={newMeeting.isVirtual}
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      isVirtual: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <label htmlFor="isVirtual">Virtual Meeting</label>
              </div>
              {newMeeting.isVirtual && (
                <Input
                  placeholder="Meeting link"
                  value={newMeeting.meetingLink}
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      meetingLink: e.target.value,
                    })
                  }
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewMeetingOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={addMeeting}>Schedule Meeting</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleBoard;
