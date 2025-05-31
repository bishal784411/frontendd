'use client';

// import { useState } from 'react';
// import { useAuth } from '@/lib/auth-context';
// import { useTicketStore } from '@/lib/ticket-store';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { TicketIcon, Plus, Search, Filter } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { format } from 'date-fns';
// import { toast } from 'sonner';
// import { Ticket } from '@/lib/types';

// export default function TicketsPage() {
//   const { user } = useAuth();
//   const { addTicket, updateTicket, getTicketsForUser, getAllTickets } = useTicketStore();
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [priorityFilter, setPriorityFilter] = useState<string>('all');
//   const [newTicket, setNewTicket] = useState({
//     title: '',
//     description: '',
//     priority: 'medium' as const,
//     category: 'technical' as const,
//   });

//   const tickets = user?.role === 'admin' ? getAllTickets() : getTicketsForUser(user?.id || '');

//   const filteredTickets = tickets.filter(ticket => {
//     const matchesSearch = 
//       ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
//     const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
//     return matchesSearch && matchesStatus && matchesPriority;
//   });

//   const handleSubmitTicket = () => {
//     if (!newTicket.title || !newTicket.description) {
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     const ticket: Ticket = {
//       id: Date.now().toString(),
//       userId: user?.id || '',
//       employeeName: user?.name || '',
//       title: newTicket.title,
//       description: newTicket.description,
//       priority: newTicket.priority,
//       category: newTicket.category,
//       status: 'open',
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     };

//     addTicket(ticket);
//     setNewTicket({
//       title: '',
//       description: '',
//       priority: 'medium',
//       category: 'technical',
//     });
//     toast.success('Ticket submitted successfully');
//   };

//   const handleUpdateStatus = (ticketId: string, status: Ticket['status']) => {
//     updateTicket(ticketId, { status });
//     toast.success('Ticket status updated');
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'open':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'in-progress':
//         return 'bg-blue-100 text-blue-800';
//       case 'resolved':
//         return 'bg-green-100 text-green-800';
//       case 'closed':
//         return 'bg-gray-100 text-gray-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const getPriorityColor = (priority: string) => {
//     switch (priority) {
//       case 'high':
//         return 'bg-red-100 text-red-800';
//       case 'medium':
//         return 'bg-orange-100 text-orange-800';
//       case 'low':
//         return 'bg-green-100 text-green-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="container mx-auto py-8">
//       <div className="flex items-center gap-4 mb-8">
//         <TicketIcon className="h-8 w-8 text-primary" />
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
//           <p className="text-muted-foreground">
//             {user?.role === 'admin' 
//               ? 'Manage and resolve support tickets' 
//               : 'Submit and track your support tickets'}
//           </p>
//         </div>
//       </div>

//       <div className="grid gap-6 md:grid-cols-3">
//         <Card>
//           <CardHeader>
//             <CardTitle>Total Tickets</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-4xl font-bold">{tickets.length}</p>
//             <p className="text-sm text-muted-foreground">All tickets</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Open Tickets</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-4xl font-bold">
//               {tickets.filter(t => t.status === 'open').length}
//             </p>
//             <p className="text-sm text-muted-foreground">Awaiting response</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Resolved Tickets</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-4xl font-bold">
//               {tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
//             </p>
//             <p className="text-sm text-muted-foreground">Successfully resolved</p>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div className="flex flex-1 items-center gap-4">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search tickets..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//           <Select value={statusFilter} onValueChange={setStatusFilter}>
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Filter by status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Status</SelectItem>
//               <SelectItem value="open">Open</SelectItem>
//               <SelectItem value="in-progress">In Progress</SelectItem>
//               <SelectItem value="resolved">Resolved</SelectItem>
//               <SelectItem value="closed">Closed</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select value={priorityFilter} onValueChange={setPriorityFilter}>
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Filter by priority" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Priority</SelectItem>
//               <SelectItem value="high">High</SelectItem>
//               <SelectItem value="medium">Medium</SelectItem>
//               <SelectItem value="low">Low</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//         {user?.role === 'employee' && (
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button>
//                 <Plus className="h-4 w-4 mr-2" />
//                 New Ticket
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Create Support Ticket</DialogTitle>
//               </DialogHeader>
//               <div className="space-y-4 py-4">
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Title</label>
//                   <Input
//                     placeholder="Enter ticket title"
//                     value={newTicket.title}
//                     onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Description</label>
//                   <Textarea
//                     placeholder="Describe your issue..."
//                     value={newTicket.description}
//                     onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium">Priority</label>
//                     <Select
//                       value={newTicket.priority}
//                       onValueChange={(value: 'low' | 'medium' | 'high') => 
//                         setNewTicket({ ...newTicket, priority: value })}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select priority" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="low">Low</SelectItem>
//                         <SelectItem value="medium">Medium</SelectItem>
//                         <SelectItem value="high">High</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium">Category</label>
//                     <Select
//                       value={newTicket.category}
//                       onValueChange={(value: 'technical' | 'hr' | 'administrative' | 'other') => 
//                         setNewTicket({ ...newTicket, category: value })}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select category" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="technical">Technical</SelectItem>
//                         <SelectItem value="hr">HR</SelectItem>
//                         <SelectItem value="administrative">Administrative</SelectItem>
//                         <SelectItem value="other">Other</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <Button className="w-full" onClick={handleSubmitTicket}>
//                   Submit Ticket
//                 </Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         )}
//       </div>

//       <div className="mt-6 space-y-4">
//         {filteredTickets.map((ticket) => (
//           <Card key={ticket.id}>
//             <CardContent className="p-6">
//               <div className="flex justify-between items-start">
//                 <div className="space-y-1">
//                   <h3 className="font-semibold">{ticket.title}</h3>
//                   <p className="text-sm text-muted-foreground">{ticket.description}</p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(ticket.priority)}`}>
//                     {ticket.priority}
//                   </span>
//                   <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)}`}>
//                     {ticket.status}
//                   </span>
//                 </div>
//               </div>
//               <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                 <div>
//                   <p className="text-muted-foreground">Submitted by</p>
//                   <p className="font-medium">{ticket.employeeName}</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Category</p>
//                   <p className="font-medium capitalize">{ticket.category}</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Created</p>
//                   <p className="font-medium">{format(new Date(ticket.createdAt), 'PPp')}</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Last Updated</p>
//                   <p className="font-medium">{format(new Date(ticket.updatedAt), 'PPp')}</p>
//                 </div>
//               </div>
//               {user?.role === 'admin' && ticket.status !== 'closed' && (
//                 <div className="mt-4 flex justify-end gap-2">
//                   {ticket.status === 'open' && (
//                     <Button
//                       variant="outline"
//                       onClick={() => handleUpdateStatus(ticket.id, 'in-progress')}
//                     >
//                       Mark In Progress
//                     </Button>
//                   )}
//                   {(ticket.status === 'open' || ticket.status === 'in-progress') && (
//                     <Button
//                       variant="outline"
//                       onClick={() => handleUpdateStatus(ticket.id, 'resolved')}
//                     >
//                       Mark Resolved
//                     </Button>
//                   )}
//                   {ticket.status === 'resolved' && (
//                     <Button
//                       variant="outline"
//                       onClick={() => handleUpdateStatus(ticket.id, 'closed')}
//                     >
//                       Close Ticket
//                     </Button>
//                   )}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         ))}
//         {filteredTickets.length === 0 && (
//           <Card>
//             <CardContent className="text-center py-8 text-muted-foreground">
//               No tickets found
//             </CardContent>
//           </Card>
//         )}
//       </div>
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