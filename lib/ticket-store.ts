import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Ticket } from './types';
import { useNotificationStore } from './notification-store';

interface TicketStore {
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  getTicketsForUser: (userId: string) => Ticket[];
  getAllTickets: () => Ticket[];
}

export const useTicketStore = create<TicketStore>()(
  persist(
    (set, get) => ({
      tickets: [],
      
      addTicket: (ticket) => {
        const { addNotification } = useNotificationStore.getState();
        set((state) => ({
          tickets: [...state.tickets, ticket]
        }));
        
        // Notify admin about new ticket
        addNotification({
          type: 'ticket',
          employeeName: ticket.employeeName,
          message: `${ticket.employeeName} raised a new ticket: ${ticket.title}`,
        });
      },
      
      updateTicket: (id, updates) => {
        const { addNotification } = useNotificationStore.getState();
        const ticket = get().tickets.find(t => t.id === id);
        
        set((state) => ({
          tickets: state.tickets.map(ticket =>
            ticket.id === id
              ? { ...ticket, ...updates, updatedAt: new Date().toISOString() }
              : ticket
          )
        }));

        // Notify employee about ticket status change
        if (ticket && updates.status) {
          addNotification({
            type: 'ticket',
            employeeName: 'Admin',
            message: `Your ticket "${ticket.title}" has been marked as ${updates.status}`,
            targetUserId: ticket.userId,
          });
        }
      },
      
      getTicketsForUser: (userId) =>
        get().tickets.filter(ticket => ticket.userId === userId),
      
      getAllTickets: () => get().tickets,
    }),
    {
      name: 'ticket-storage',
    }
  )
);