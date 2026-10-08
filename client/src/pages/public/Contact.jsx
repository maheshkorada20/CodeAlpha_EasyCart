import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Contact EasyCart Support</h1>
        <p className="text-sm text-gray-500">
          Have questions about your order, delivery timeline, or products? Our team is here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4">
            <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Email Us</h3>
              <p className="text-xs text-gray-500 mt-1">support@easycart.com</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Response within 24 hours</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Call Toll-Free</h3>
              <p className="text-xs text-gray-500 mt-1">1800-123-EASY (3279)</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Mon - Sat: 9 AM - 8 PM IST</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Registered HQ</h3>
              <p className="text-xs text-gray-500 mt-1">EasyCart Retail Pvt Ltd, Tech Park 4, Mumbai, Maharashtra 400050</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Message Received!</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Thank you for reaching out. An EasyCart customer representative will respond to your registered email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Mahesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="mahesh@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Order inquiry, return status, or feedback..."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we assist you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-primary-600 text-white font-bold rounded-lg shadow-sm hover:bg-primary-700 transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
