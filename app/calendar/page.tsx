// 'use client';

// import { useState } from 'react';
// import { useAuth } from '@/lib/auth-context';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Calendar, Clock, Check, X, ChevronLeft, ChevronRight, Link2, Edit2 } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
// import { toast } from 'sonner';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";

// interface Event {
//   id: string;
//   title: string;
//   description: string;
//   date: Date;
//   startTime: { time: string; period: 'AM' | 'PM' };
//   endTime: { time: string; period: 'AM' | 'PM' };
//   meetingLink?: string;
//   createdBy: string;
//   status: 'pending' | 'approved' | 'rejected';
//   creatorRole: 'admin' | 'employee';
//   participants: string[];
// }

// const employees = [
//   { id: '1', name: 'John Admin', role: 'admin' },
//   { id: '2', name: 'Jane Employee', role: 'employee' },
//   { id: '3', name: 'Mike Johnson', role: 'employee' },
//   { id: '4', name: 'Sarah Williams', role: 'employee' },
// ];

// export default function CalendarPage() {
//   const { user } = useAuth();
//   const [events, setEvents] = useState<Event[]>([
//     {
//       id: '1',
//       title: 'Team Meeting',
//       description: 'Weekly team sync',
//       date: new Date(2025, 4, 6),
//       startTime: { time: '10:00', period: 'AM' },
//       endTime: { time: '11:00', period: 'AM' },
//       meetingLink: 'https://zoom.us/j/123456789',
//       createdBy: 'John Admin',
//       status: 'approved',
//       creatorRole: 'admin',
//       participants: ['1', '2']
//     },
//     {
//       id: '2',
//       title: 'Project Review',
//       description: 'Monthly project status review',
//       date: new Date(2025, 4, 10),
//       startTime: { time: '02:00', period: 'PM' },
//       endTime: { time: '03:30', period: 'PM' },
//       meetingLink: 'https://meet.google.com/abc-defg-hij',
//       createdBy: 'John Admin',
//       status: 'approved',
//       creatorRole: 'admin',
//       participants: ['1', '2', '3']
//     },
//     {
//       id: '3',
//       title: 'Training Session',
//       description: 'New tools introduction',
//       date: new Date(2025, 4, 19),
//       startTime: { time: '11:00', period: 'AM' },
//       endTime: { time: '12:30', period: 'PM' },
//       meetingLink: 'https://teams.microsoft.com/l/meetup-join/123',
//       createdBy: 'Jane Employee',
//       status: 'pending',
//       creatorRole: 'employee',
//       participants: ['1', '2', '3', '4']
//     }
//   ]);
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [newEvent, setNewEvent] = useState({
//     title: '',
//     description: '',
//     startTime: { time: '09:00', period: 'AM' as const },
//     endTime: { time: '10:00', period: 'AM' as const },
//     meetingLink: '',
//     participants: [] as string[]
//   });
//   const [showEventDialog, setShowEventDialog] = useState(false);
//   const [currentMonth, setCurrentMonth] = useState(new Date());

//   const validateTimeFormat = (time: string) => {
//     const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
//     return regex.test(time);
//   };

//   const handleAddEvent = () => {
//     if (!selectedDate || !newEvent.title) {
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     if (!validateTimeFormat(newEvent.startTime.time) || !validateTimeFormat(newEvent.endTime.time)) {
//       toast.error('Please enter time in HH:mm format (e.g., 09:00)');
//       return;
//     }

//     // Convert 12-hour format to 24-hour for comparison
//     const convertTo24Hour = (time: { time: string; period: 'AM' | 'PM' }) => {
//       const [hours, minutes] = time.time.split(':').map(Number);
//       let hour24 = hours;
//       if (time.period === 'PM' && hours !== 12) hour24 += 12;
//       if (time.period === 'AM' && hours === 12) hour24 = 0;
//       return { hours: hour24, minutes };
//     };

//     const startTime24 = convertTo24Hour(newEvent.startTime);
//     const endTime24 = convertTo24Hour(newEvent.endTime);

//     const startDate = new Date().setHours(startTime24.hours, startTime24.minutes);
//     const endDate = new Date().setHours(endTime24.hours, endTime24.minutes);

//     if (endDate <= startDate) {
//       toast.error('End time must be after start time');
//       return;
//     }

//     const event: Event = {
//       id: isEditing && selectedEvent ? selectedEvent.id : Date.now().toString(),
//       title: newEvent.title,
//       description: newEvent.description,
//       date: selectedDate,
//       startTime: newEvent.startTime,
//       endTime: newEvent.endTime,
//       meetingLink: newEvent.meetingLink,
//       createdBy: user?.name || '',
//       status: user?.role === 'admin' ? 'approved' : 'pending',
//       creatorRole: user?.role || 'employee',
//       participants: user?.role === 'admin' ? newEvent.participants : ['1'] // Admin ID is always included
//     };

//     if (isEditing && selectedEvent) {
//       setEvents(events.map(e => e.id === selectedEvent.id ? event : e));
//       toast.success('Event updated successfully');
//     } else {
//       setEvents([...events, event]);
//       toast.success(user?.role === 'admin' ? 'Event created successfully' : 'Meeting request submitted');
//     }

//     setNewEvent({
//       title: '',
//       description: '',
//       startTime: { time: '09:00', period: 'AM' },
//       endTime: { time: '10:00', period: 'AM' },
//       meetingLink: '',
//       participants: []
//     });
//     setShowEventDialog(false);
//     setSelectedDate(null);
//     setIsEditing(false);
//   };

//   const handleEditEvent = (event: Event) => {
//     setNewEvent({
//       title: event.title,
//       description: event.description,
//       startTime: event.startTime,
//       endTime: event.endTime,
//       meetingLink: event.meetingLink || '',
//       participants: event.participants
//     });
//     setSelectedDate(event.date);
//     setIsEditing(true);
//     setSelectedEvent(event);  
//     setShowEventDialog(true);
//   };

//   const handleUpdateEventStatus = (eventId: string, status: 'approved' | 'rejected') => {
//     setEvents(events.map(event => 
//       event.id === eventId ? { ...event, status } : event
//     ));
//     setSelectedEvent(null);
//     toast.success(`Meeting ${status}`);
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'approved':
//         return 'bg-green-100 text-green-800';
//       case 'rejected':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-yellow-100 text-yellow-800';
//     }
//   };

//   const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//   const monthStart = startOfMonth(currentMonth);
//   const monthEnd = endOfMonth(currentMonth);
//   const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

//   const getEventsForDay = (date: Date) => {
//     return events.filter(event => 
//       isSameDay(event.date, date) && 
//       (user?.role === 'admin' || event.participants.includes(user?.id || ''))
//     );
//   };

//   return (
//     <div className="container mx-auto py-8">
//       <div className="grid gap-8">
//         <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
//           <div className="flex items-center gap-4">
//             <Calendar className="h-8 w-8 text-primary" />
//             <div>
//               <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
//               <p className="text-muted-foreground">
//                 {user?.role === 'admin' 
//                   ? 'Manage meetings and events' 
//                   : 'Request and view meetings'}
//               </p>
//             </div>
//           </div>
//           <div className="flex justify-end items-center gap-4">
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <span className="text-lg font-semibold">
//               {format(currentMonth, 'MMMM yyyy')}
//             </span>
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
//             >
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         <Card>
//           <CardContent className="p-0">
//             <div className="grid grid-cols-7 bg-muted">
//               {daysOfWeek.map(day => (
//                 <div key={day} className="p-4 text-center font-semibold border-b">
//                   {day}
//                 </div>
//               ))}
//             </div>
//             <div className="grid grid-cols-7">
//               {daysInMonth.map((date, index) => {
//                 const dayEvents = getEventsForDay(date);
//                 const isSelected = selectedDate && isSameDay(date, selectedDate);
//                 return (
//                   <div
//                     key={date.toString()}
//                     className={`min-h-[150px] p-2 border relative cursor-pointer hover:bg-muted/50 ${
//                       isSelected ? 'bg-muted' : ''
//                     }`}
//                     onClick={() => {
//                       setSelectedDate(date);
//                       if (user?.role === 'admin') {
//                         setShowEventDialog(true);
//                       }
//                     }}
//                   >
//                     <span className="text-sm font-medium">{format(date, 'd')}</span>
//                     <div className="mt-2 space-y-1">
//                       {dayEvents.map(event => (
//                         <div
//                           key={event.id}
//                           className={`text-xs p-2 rounded ${getStatusColor(event.status)}`}
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             setSelectedEvent(event);
//                           }}
//                         >
//                           <div className="font-medium truncate">{event.title}</div>
//                           <div className="text-[10px] opacity-90">
//                             {event.startTime.time} {event.startTime.period} - {event.endTime.time} {event.endTime.period}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               {isEditing ? 'Edit Meeting' : user?.role === 'admin' ? 'Create Meeting' : 'Request Meeting'}
//             </DialogTitle>
//             {selectedDate && (
//               <DialogDescription>
//                 Date: {format(selectedDate, 'PPPP')}
//               </DialogDescription>
//             )}
//           </DialogHeader>
//           <div className="grid gap-4 py-4">
//             <div className="grid gap-2">
//               <label className="text-sm font-medium">Title</label>
//               <Input
//                 placeholder="Enter meeting title"
//                 value={newEvent.title}
//                 onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
//               />
//             </div>
//             <div className="grid gap-2">
//               <label className="text-sm font-medium">Description</label>
//               <Input
//                 placeholder="Enter meeting description"
//                 value={newEvent.description}
//                 onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="grid gap-2">
//                 <label className="text-sm font-medium">Start Time</label>
//                 <div className="flex gap-2">
//                   <Input
//                     placeholder="HH:mm"
//                     value={newEvent.startTime.time}
//                     onChange={(e) => 
//                       setNewEvent({ 
//                         ...newEvent, 
//                         startTime: { ...newEvent.startTime, time: e.target.value }
//                       })
//                     }
//                   />
//                   <Select
//                     value={newEvent.startTime.period}
//                     onValueChange={(value: 'AM' | 'PM') => 
//                       setNewEvent({ 
//                         ...newEvent, 
//                         startTime: { ...newEvent.startTime, period: value }
//                       })
//                     }
//                   >
//                     <SelectTrigger className="w-[80px]">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="AM">AM</SelectItem>
//                       <SelectItem value="PM">PM</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//               <div className="grid gap-2">
//                 <label className="text-sm font-medium">End Time</label>
//                 <div className="flex gap-2">
//                   <Input
//                     placeholder="HH:mm"
//                     value={newEvent.endTime.time}
//                     onChange={(e) => 
//                       setNewEvent({ 
//                         ...newEvent, 
//                         endTime: { ...newEvent.endTime, time: e.target.value }
//                       })
//                     }
//                   />
//                   <Select
//                     value={newEvent.endTime.period}
//                     onValueChange={(value: 'AM' | 'PM') => 
//                       setNewEvent({ 
//                         ...newEvent, 
//                         endTime: { ...newEvent.endTime, period: value }
//                       })
//                     }
//                   >
//                     <SelectTrigger className="w-[80px]">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="AM">AM</SelectItem>
//                       <SelectItem value="PM">PM</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             </div>
//             <div className="grid gap-2">
//               <label className="text-sm font-medium">Meeting Link</label>
//               <Input
//                 placeholder="Enter meeting link"
//                 value={newEvent.meetingLink}
//                 onChange={(e) => setNewEvent({ ...newEvent, meetingLink: e.target.value })}
//               />
//             </div>
//             {user?.role === 'admin' && (
//               <div className="grid gap-2">
//                 <label className="text-sm font-medium">Select Participants</label>
//                 <div className="space-y-2">
//                   {employees.map(emp => (
//                     <div key={emp.id} className="flex items-center space-x-2">
//                       <Checkbox
//                         id={emp.id}
//                         checked={newEvent.participants.includes(emp.id)}
//                         onCheckedChange={(checked) => {
//                           setNewEvent({
//                             ...newEvent,
//                             participants: checked
//                               ? [...newEvent.participants, emp.id]
//                               : newEvent.participants.filter(id => id !== emp.id)
//                           });
//                         }}
//                       />
//                       <label htmlFor={emp.id} className="text-sm">
//                         {emp.name}
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//             <Button onClick={handleAddEvent}>
//               {isEditing ? 'Update Meeting' : user?.role === 'admin' ? 'Create Meeting' : 'Submit Request'}
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {selectedEvent && (
//         <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>{selectedEvent.title}</DialogTitle>
//               <DialogDescription>{selectedEvent.description}</DialogDescription>
//             </DialogHeader>
//             <div className="grid gap-4">
//               <div className="grid gap-2">
//                 <div className="flex items-center gap-2">
//                   <Calendar className="h-4 w-4" />
//                   <span>{format(selectedEvent.date, 'PPP')}</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Clock className="h-4 w-4" />
//                   <span>
//                     {selectedEvent.startTime.time} {selectedEvent.startTime.period} - {selectedEvent.endTime.time} {selectedEvent.endTime.period}
//                   </span>
//                 </div>
//                 {selectedEvent.meetingLink && (
//                   <div className="flex items-center gap-2">
//                     <Link2 className="h-4 w-4" />
//                     <a
//                       href={selectedEvent.meetingLink}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-primary hover:underline"
//                     >
//                       Join Meeting
//                     </a>
//                   </div>
//                 )}
//               </div>
//               <div className="space-y-2">
//                 <p className="text-sm text-muted-foreground">
//                   Created by: {selectedEvent.createdBy}
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                   Participants: {selectedEvent.participants.map(id => 
//                     employees.find(emp => emp.id === id)?.name
//                   ).join(', ')}
//                 </p>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedEvent.status)}`}>
//                   {selectedEvent.status}
//                 </span>
//                 <div className="flex gap-2">
//                   {user?.role === 'admin' && (
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => handleEditEvent(selectedEvent)}
//                     >
//                       <Edit2 className="h-4 w-4 mr-2" />
//                       Edit
//                     </Button>
//                   )}
//                   {user?.role === 'admin' && selectedEvent.status === 'pending' && (
//                     <>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleUpdateEventStatus(selectedEvent.id, 'approved')}
//                       >
//                         <Check className="h-4 w-4 mr-2" />
//                         Approve
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => handleUpdateEventStatus(selectedEvent.id, 'rejected')}
//                       >
//                         <X className="h-4 w-4 mr-2" />
//                         Reject
//                       </Button>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// }

export default function CalendarPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">🚧 Work in Progress</h1>
        <p className="text-lg text-gray-600">The calendar page is currently under maintenance. Please check back later.</p>
      </div>
    </div>
  );
}