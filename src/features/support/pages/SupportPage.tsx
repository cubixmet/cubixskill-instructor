import React, { useState } from 'react';
import { Plus, ChevronDown, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SupportTicket } from '../../../types/models.types';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';

export const SupportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'options' | 'knowledge'>('tickets');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const tickets: SupportTicket[] = [
    {
      id: 't-1',
      ticketNumber: 'TICK-9041',
      subject: 'Issue setting up Bunny Stream CDN video watermark',
      category: 'Media & CDN',
      priority: 'High',
      status: 'In Progress',
      createdAt: '2026-08-03',
      lastUpdated: '1 hour ago',
      description: 'The automated text watermark is not overlaying on iOS Safari playback.',
    },
    {
      id: 't-2',
      ticketNumber: 'TICK-8812',
      subject: 'GST Invoice breakdown for July credit purchase',
      category: 'Billing & Tax',
      priority: 'Medium',
      status: 'Resolved',
      createdAt: '2026-07-28',
      lastUpdated: '2 days ago',
      description: 'Need B2B GST tax invoice copy for accounting team.',
    },
  ];

  const supportOptions = [
    { title: 'Chatbot & Automated FAQ Assistance', cost: 'Free', available: '24/7 Instant', enabled: true },
    { title: 'Priority Live Chat Support', cost: '10 Credits / ticket', available: 'Mon-Sat (9 AM - 8 PM)', enabled: true },
    { title: 'Dedicated Account Manager & Strategy Call', cost: '100 Credits / month', available: 'Dedicated SLA', enabled: false },
    { title: 'Remote Screen Share Troubleshooting', cost: '25 Credits / session', available: 'On-Demand', enabled: true },
  ];

  const faqs = [
    {
      question: 'How are per-student credits calculated?',
      answer: 'Credits are deducted only when a student actually enrolls into your course. Each course feature (like video hosting, quizzes, and certificates) adds a transparent credit cost.'
    },
    {
      question: 'Can I connect a custom domain to my storefront?',
      answer: 'Yes! Navigate to Website Builder -> Domain & SEO to enter your custom domain and map the CNAME record.'
    },
    {
      question: 'What happens when my credit balance hits zero?',
      answer: 'Existing enrolled students maintain full access to their courses. New enrollments will be paused until you top up your credit wallet.'
    }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academy Support Desk</h1>
          <p className="text-xs text-slate-500 mt-1">Get technical help, configure support credit channels, and view active tickets.</p>
        </div>
        <div>
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsTicketModalOpen(true)}
          >
            Open New Ticket
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/80 gap-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'tickets', label: 'My Support Tickets' },
          { id: 'options', label: 'Support Channels & Credit Costs' },
          { id: 'knowledge', label: 'Instructor Knowledge Base' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* AnimatePresence Content Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'tickets' && (
            <Card padding="none" className="overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-4">Ticket Ref</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Priority</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Last Updated</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tickets.map((tk) => (
                      <tr key={tk.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{tk.ticketNumber}</td>
                        <td className="p-4 font-bold text-slate-900">{tk.subject}</td>
                        <td className="p-4 font-medium text-slate-500">{tk.category}</td>
                        <td className="p-4">
                          <Badge variant={tk.priority === 'High' ? 'error' : 'primary'} size="sm">
                            {tk.priority}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={tk.status === 'In Progress' ? 'warning' : 'success'} dot>
                            {tk.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-500">{tk.lastUpdated}</td>
                        <td className="p-4 text-right">
                          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">View Ticket</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden p-4 space-y-3">
                {tickets.map((tk) => (
                  <div key={tk.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{tk.ticketNumber}</span>
                      <Badge variant={tk.status === 'In Progress' ? 'warning' : 'success'} dot>{tk.status}</Badge>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{tk.subject}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-500">{tk.category}</span>
                      <button className="text-blue-600 font-bold">Details</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'options' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {supportOptions.map((opt) => (
                <Card key={opt.title} hoverable className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">{opt.title}</h3>
                    <Badge variant="primary">{opt.cost}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">Availability: {opt.available}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-700">Channel Enabled</span>
                    <input type="checkbox" defaultChecked={opt.enabled} className="accent-blue-600 w-4 h-4 rounded cursor-pointer" />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-4 max-w-3xl">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <Card key={idx} padding="none" className="overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 flex items-center justify-between text-left focus:outline-none cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm font-bold text-slate-900">{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Submit Ticket Modal */}
      <Modal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        title="Open Support Ticket"
        subtitle="Submit a ticket to CubixSkill technical support team."
      >
        <div className="space-y-4">
          <Input label="Subject Title" placeholder="e.g. Issue connecting custom domain CNAME" />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Category</label>
            <select className="w-full h-11 px-4 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600">
              <option>Media & CDN</option>
              <option>Billing & Tax</option>
              <option>Domain & SSL</option>
              <option>Student Access</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">Description</label>
            <textarea
              rows={4}
              placeholder="Describe the issue or error message you encountered..."
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsTicketModalOpen(false)}>
              Cancel
            </Button>
            <Button leftIcon={<MessageSquare className="w-4 h-4" />} onClick={() => setIsTicketModalOpen(false)}>
              Submit Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
