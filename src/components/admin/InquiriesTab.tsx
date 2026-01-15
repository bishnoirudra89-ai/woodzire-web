import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MailOpen, Trash2, Search, Loader2, Phone, MessageSquare } from 'lucide-react';
import { useInquiries, useMarkInquiryRead, useDeleteInquiry, Inquiry } from '@/hooks/useInquiries';
import { format } from 'date-fns';

const InquiriesTab = () => {
  const { data: inquiries = [], isLoading } = useInquiries();
  const markRead = useMarkInquiryRead();
  const deleteInquiry = useDeleteInquiry();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'unread' && !inquiry.is_read) ||
      (filterStatus === 'read' && inquiry.is_read);
    
    return matchesSearch && matchesFilter;
  });

  const handleToggleRead = (id: string, currentStatus: boolean) => {
    markRead.mutate({ id, isRead: !currentStatus });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this inquiry?')) {
      deleteInquiry.mutate(id);
    }
  };

  const handleExpand = (inquiry: Inquiry) => {
    setExpandedId(expandedId === inquiry.id ? null : inquiry.id);
    if (!inquiry.is_read) {
      markRead.mutate({ id: inquiry.id, isRead: true });
    }
  };

  const unreadCount = inquiries.filter(i => !i.is_read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display">Customer Inquiries</h2>
          <p className="text-muted-foreground">
            {unreadCount > 0 && <span className="text-blue-600">{unreadCount} unread</span>}
            {unreadCount === 0 && 'All caught up!'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inquiries..."
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-charcoal text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries List */}
      <div className="space-y-3">
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No inquiries found
          </div>
        ) : (
          filteredInquiries.map((inquiry) => (
            <motion.div
              key={inquiry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-card border rounded-xl overflow-hidden cursor-pointer transition-all ${
                !inquiry.is_read ? 'border-blue-300 bg-blue-50/30' : 'border-border'
              }`}
            >
              <div 
                className="p-4 flex items-center gap-4"
                onClick={() => handleExpand(inquiry)}
              >
                <div className={`p-2 rounded-lg ${!inquiry.is_read ? 'bg-blue-100' : 'bg-muted'}`}>
                  {!inquiry.is_read ? (
                    <Mail size={20} className="text-blue-600" />
                  ) : (
                    <MailOpen size={20} className="text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className={`font-medium ${!inquiry.is_read ? 'text-foreground' : ''}`}>
                      {inquiry.name}
                    </span>
                    {inquiry.product && (
                      <span className="text-xs px-2 py-0.5 bg-gold/10 text-gold rounded">
                        {inquiry.product}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{inquiry.message}</p>
                </div>

                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                </span>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleToggleRead(inquiry.id, inquiry.is_read)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title={inquiry.is_read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {inquiry.is_read ? <Mail size={16} /> : <MailOpen size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(inquiry.id)}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === inquiry.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border p-6 bg-background"
                >
                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-muted-foreground" />
                      <a href={`mailto:${inquiry.email}`} className="text-gold hover:underline">
                        {inquiry.email}
                      </a>
                    </div>
                    {inquiry.phone && (
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-muted-foreground" />
                        <a href={`tel:${inquiry.phone}`} className="text-gold hover:underline">
                          {inquiry.phone}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={16} className="text-muted-foreground" />
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Message</span>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap">{inquiry.message}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <a
                      href={`mailto:${inquiry.email}?subject=Re: Your Inquiry${inquiry.product ? ` about ${inquiry.product}` : ''}`}
                      className="btn-pill inline-flex items-center gap-2"
                    >
                      <Mail size={16} />
                      Reply via Email
                    </a>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default InquiriesTab;
