"use client";

import { useState } from 'react';
import {
  FileText, Utensils, Briefcase, MapPin,
  Bold, Italic, Heading1, Heading2, List, Link as LinkIcon
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WriteArticleCTA from '@/components/WriteArticleCTA';
import { useCampuses } from '@/hooks/useCampuses';
import { notify } from '@/lib/toast';
import { Spinner } from '@/components/ui/spinner';

export default function Contribute() {
  const { campuses: apiCampuses } = useCampuses();
  const [selectedType, setSelectedType] = useState('article');
  const [selectedCampus, setSelectedCampus] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const contributionTypes = [
    { id: 'article', label: 'Write an article', icon: FileText, description: 'Most common' },
    { id: 'food', label: 'Add a food spot', icon: Utensils, description: 'Share local gems' },
    { id: 'experience', label: 'Share an experience', icon: Briefcase, description: 'Help juniors learn' },
    { id: 'trip', label: 'Share a trip', icon: MapPin, description: 'Campus events & more' },
  ];

  const sections = [
    'Week 1',
    'Living',
    'Food',
    'Experiences',
    'Academics',
    'How-To'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      notify.error('Add a title before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      notify.success('Article submitted for review! We will notify you when it is published.');
      setTitle('');
      setContent('');
      setTags('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      
      <section className="bg-section py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-black mb-3">
            Contribute to NIAT Insider
          </h1>
          <p className="text-black text-lg">
            Share what you know. Help the next student.
          </p>
        </div>
      </section>

      <section className="py-8 bg-white border-b border-[rgba(30,41,59,0.1)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {contributionTypes.map(({ id, label, icon: Icon, description }) =>
              id === 'article' ? (
                <WriteArticleCTA
                  key={id}
                  label={
                    <>
                      <Icon className="h-8 w-8 mb-3 text-[#991b1b]" />
                      <h3 className="font-bold text-sm mb-1">{label}</h3>
                      <p className="text-xs text-black">{description}</p>
                    </>
                  }
                  className="p-4 rounded-lg text-left transition-all block bg-section text-black hover:shadow-soft hover:bg-[#fbf2f3]"
                  disabledClassName="cursor-not-allowed opacity-60"
                  subtitleClassName="mt-2 text-xs text-[#64748b]"
                />
              ) : (
                <button
                  key={id}
                  onClick={() => setSelectedType(id)}
                  className={`p-4 rounded-lg text-left transition-all ${
                    selectedType === id
                      ? 'bg-[#991b1b] text-white shadow-card'
                      : 'bg-section text-black hover:shadow-soft'
                  }`}
                >
                  <Icon className={`h-8 w-8 mb-3 ${selectedType === id ? 'text-white' : 'text-[#991b1b]'}`} />
                  <h3 className="font-bold text-sm mb-1">{label}</h3>
                  <p className={`text-xs ${selectedType === id ? 'text-white/80' : 'text-black'}`}>
                    {description}
                  </p>
                </button>
              )
            )}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-2">
                Campus
              </label>
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-[rgba(30,41,59,0.1)] rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
              >
                <option value="">Select your campus</option>
                {apiCampuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-2">
                Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border border-[rgba(30,41,59,0.1)] rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
              >
                <option value="">Select a section</option>
                {sections.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Best PG Options Near Campus — 2025 Guide"
                required
                className="w-full px-4 py-3 bg-white border border-[rgba(30,41,59,0.1)] rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-2">
                Content
              </label>
              
              <div className="flex items-center gap-1 bg-gray-50 border border-[rgba(30,41,59,0.1)] border-b-0 rounded-t-lg p-2">
                <button type="button" className="p-2 hover:bg-gray-200 rounded transition-colors">
                  <Bold className="h-4 w-4 text-gray-600" />
                </button>
                <button type="button" className="p-2 hover:bg-gray-200 rounded transition-colors">
                  <Italic className="h-4 w-4 text-gray-600" />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <button type="button" className="p-2 hover:bg-gray-200 rounded transition-colors">
                  <Heading1 className="h-4 w-4 text-gray-600" />
                </button>
                <button type="button" className="p-2 hover:bg-gray-200 rounded transition-colors">
                  <Heading2 className="h-4 w-4 text-gray-600" />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <button type="button" className="p-2 hover:bg-gray-200 rounded transition-colors">
                  <List className="h-4 w-4 text-gray-600" />
                </button>
                <button type="button" className="p-2 hover:bg-gray-200 rounded transition-colors">
                  <LinkIcon className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article here..."
                required
                rows={12}
                className="w-full px-4 py-3 bg-white border border-[rgba(30,41,59,0.1)] rounded-b-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#991b1b] resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., hostel, budget, first-year"
                className="w-full px-4 py-3 bg-white border border-[rgba(30,41,59,0.1)] rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary text-lg px-8 py-3 inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" className="border-white/30 border-t-white" />
                    Submitting…
                  </>
                ) : (
                  'Submit for Review'
                )}
              </button>
            </div>

            <div className="mt-6 bg-[#fbf2f3] border-l-4 border-[#991b1b] rounded-r-lg p-4">
              <p className="text-sm text-black">
                <span className="font-medium">Note:</span> Your article will be reviewed by the 
                Campus Ambassador within 24 hours before publishing.
              </p>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
