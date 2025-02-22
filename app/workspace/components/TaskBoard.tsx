'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Clock,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Settings,
  Star,
  Tags,
  Timer,
  Trash2,
  User,
  Users,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee: string;
  watchers: string[];
  dueDate?: string;
  estimatedTime?: number;
  labels: string[];
  attachments: number;
  comments: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
  category: 'feature' | 'bug' | 'task' | 'improvement';
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  limit?: number;
}

const TaskBoard = () => {
  const { data: session } = useSession();
  const [columns, setColumns] = useState<Column[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'timeline' | 'calendar'>(
    'board'
  );
  const [isMetricsVisible, setIsMetricsVisible] = useState(true);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'urgent' | 'high' | 'medium' | 'low',
    category: 'task' as 'feature' | 'bug' | 'task' | 'improvement',
    estimatedTime: 0,
    dueDate: '',
    labels: [] as string[],
  });

  useEffect(() => {
    const defaultColumns: Column[] = [
      {
        id: uuidv4(),
        title: 'Backlog',
        tasks: [],
        limit: 0,
      },
      {
        id: uuidv4(),
        title: 'To Do',
        tasks: [],
        limit: 5,
      },
      {
        id: uuidv4(),
        title: 'In Progress',
        tasks: [],
        limit: 3,
      },
      {
        id: uuidv4(),
        title: 'Done',
        tasks: [],
        limit: 0,
      },
    ];
    setColumns(defaultColumns);
  }, []);

  const addTask = (columnId: string) => {
    if (!session?.user?.name) return;

    const task: Task = {
      id: uuidv4(),
      title: newTask.title,
      description: newTask.description,
      status: columns.find((col) => col.id === columnId)?.title || '',
      priority: newTask.priority,
      assignee: session.user.name,
      watchers: [],
      dueDate: newTask.dueDate,
      estimatedTime: newTask.estimatedTime,
      labels: newTask.labels,
      attachments: 0,
      comments: 0,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: newTask.category,
    };

    setColumns(
      columns.map((column) =>
        column.id === columnId
          ? { ...column, tasks: [...column.tasks, task] }
          : column
      )
    );

    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: 'task',
      estimatedTime: 0,
      dueDate: '',
      labels: [],
    });
    setIsNewTaskOpen(false);
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    return (
      colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug':
        return '🐛';
      case 'feature':
        return '✨';
      case 'improvement':
        return '⚡';
      default:
        return '📋';
    }
  };

  const getColumnMetrics = (column: Column) => {
    const tasks = column.tasks;
    const total = tasks.length;
    const overdue = tasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < new Date()
    ).length;
    const highPriority = tasks.filter(
      (task) => task.priority === 'urgent' || task.priority === 'high'
    ).length;

    return { total, overdue, highPriority };
  };

  const onDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destColumn = columns.find(
      (col) => col.id === destination.droppableId
    );

    if (!sourceColumn || !destColumn) return;

    // Check WIP limit
    if (
      destColumn.limit &&
      destColumn.tasks.length >= destColumn.limit &&
      sourceColumn.id !== destColumn.id
    ) {
      alert(
        `Cannot move task. Column "${destColumn.title}" has reached its limit of ${destColumn.limit} tasks.`
      );
      return;
    }

    const task = sourceColumn.tasks[source.index];
    const newSourceTasks = [...sourceColumn.tasks];
    newSourceTasks.splice(source.index, 1);

    const newDestTasks = [...destColumn.tasks];
    newDestTasks.splice(destination.index, 0, {
      ...task,
      status: destColumn.title,
      updatedAt: new Date().toISOString(),
    });

    setColumns(
      columns.map((column) => {
        if (column.id === source.droppableId) {
          return { ...column, tasks: newSourceTasks };
        }
        if (column.id === destination.droppableId) {
          return { ...column, tasks: newDestTasks };
        }
        return column;
      })
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Project Tasks</h1>
            <div className="flex items-center space-x-2">
              <Select
                value={viewMode}
                onValueChange={(value: 'board' | 'timeline' | 'calendar') =>
                  setViewMode(value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="board">Board</SelectItem>
                  {/* <SelectItem value="timeline">Timeline</SelectItem>
                  <SelectItem value="calendar">Calendar</SelectItem> */}
                </SelectContent>
              </Select>
              {/* <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button> */}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div> */}
            <Button
              onClick={() => setIsTaskDialogOpen(true)}
              className="bg-orange-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Overview */}
      {isMetricsVisible && (
        <div className="grid grid-cols-4 gap-4 p-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {columns.reduce((acc, col) => acc + col.tasks.length, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Tasks In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {columns.find((col) => col.title === 'In Progress')?.tasks
                  .length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Overdue Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {columns.reduce(
                  (acc, col) =>
                    acc +
                    col.tasks.filter(
                      (task) =>
                        task.dueDate && new Date(task.dueDate) < new Date()
                    ).length,
                  0
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Completed This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {columns
                  .find((col) => col.title === 'Done')
                  ?.tasks.filter((task) => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(task.updatedAt) > weekAgo;
                  }).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Board View */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 p-6 overflow-x-auto">
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="w-[280px] flex-shrink-0"
                >
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h2 className="font-semibold text-gray-700">
                          {column.title}
                        </h2>
                        <span className="text-sm text-gray-500">
                          {column.tasks.length}{' '}
                          {column.limit ? `/ ${column.limit}` : ''}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setActiveColumn(column.id);
                          setIsNewTaskOpen(true);
                        }}
                        className="hover:bg-gray-200 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {column.tasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white"
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center space-x-2">
                                    <span>
                                      {getCategoryIcon(task.category)}
                                    </span>
                                    <h3 className="font-medium text-gray-900">
                                      {task.title}
                                    </h3>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger>
                                      <MoreVertical className="w-4 h-4 text-gray-500" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem>Edit</DropdownMenuItem>
                                      <DropdownMenuItem>
                                        Add Label
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        Set Due Date
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600">
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>

                                {task.description && (
                                  <p className="text-sm text-gray-600 mt-2">
                                    {task.description}
                                  </p>
                                )}

                                <div className="mt-4 space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center text-gray-500">
                                      <User className="w-4 h-4 mr-1" />
                                      {task.assignee}
                                    </div>
                                    {task.watchers.length > 0 && (
                                      <div className="flex items-center text-gray-500">
                                        <Users className="w-4 h-4 mr-1" />
                                        {task.watchers.length}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between">
                                    {task.dueDate && (
                                      <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(
                                          task.dueDate
                                        ).toLocaleDateString()}
                                      </div>
                                    )}
                                    {task.estimatedTime !== undefined &&
                                      task.estimatedTime > 0 && (
                                        <div className="flex items-center text-sm text-gray-500">
                                          <Timer className="w-4 h-4 mr-1" />
                                          {task.estimatedTime}h
                                        </div>
                                      )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                                        task.priority
                                      )}`}
                                    >
                                      {task.priority}
                                    </span>
                                    {task.labels.map((label) => (
                                      <span
                                        key={label}
                                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                      >
                                        {label}
                                      </span>
                                    ))}
                                  </div>

                                  {task.progress > 0 && (
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className="bg-blue-600 h-1.5 rounded-full"
                                        style={{ width: `${task.progress}%` }}
                                      />
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between text-sm text-gray-500">
                                    {task.attachments > 0 && (
                                      <div className="flex items-center">
                                        <span className="mr-2">📎</span>
                                        {task.attachments}
                                      </div>
                                    )}
                                    {task.comments > 0 && (
                                      <div className="flex items-center">
                                        <span className="mr-2">💬</span>
                                        {task.comments}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* New Task Dialog */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />

            <Textarea
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />

            <Select
              value={newTask.priority}
              onValueChange={(value: 'urgent' | 'high' | 'medium' | 'low') =>
                setNewTask({ ...newTask, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={newTask.category}
              onValueChange={(
                value: 'feature' | 'bug' | 'task' | 'improvement'
              ) => setNewTask({ ...newTask, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Estimated hours"
                value={newTask.estimatedTime}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    estimatedTime: parseInt(e.target.value) || 0,
                  })
                }
              />
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => activeColumn && addTask(activeColumn)}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Button click */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              By default will be added to backlog
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />

            <Textarea
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />

            <Select
              value={newTask.priority}
              onValueChange={(value: 'urgent' | 'high' | 'medium' | 'low') =>
                setNewTask({ ...newTask, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={newTask.category}
              onValueChange={(
                value: 'feature' | 'bug' | 'task' | 'improvement'
              ) => setNewTask({ ...newTask, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Estimated hours"
                value={newTask.estimatedTime}
                onChange={(e) =>
                  setNewTask({
                    ...newTask,
                    estimatedTime: parseInt(e.target.value) || 0,
                  })
                }
              />
              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => activeColumn && addTask(activeColumn)}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskBoard;
