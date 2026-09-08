import re

# Read the file
with open('C:/Users/Admin/Documents/Default Project/frontend/src/app/adtarbo/page.tsx', 'r') as f:
    content = f.read()

# Find the position of the last scroll trigger comment and replace it
# We'll add the new section before the scroll trigger animation comment
pattern = r'(</section>\n\n/\* Scroll trigger animation \*/)'
replacement = '''</section>

/* Google Business Posts Section */
<section className="py-24 bg-[linear-gradient(180deg,#0d0d2b_0%,#1a1a3e_100%)]">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mb-16 text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
        <MessageCircle className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Google Posts</span>
      </div>
      <h2 className="mb-4 text-3xl font-bold sm:text-5xl">
        Create.
        <span className="gradient-text from-purple-600 to-cyan-500">Schedule.</span>
        <span className="gradient-text from-purple-600 to-cyan-500 after:ml-2">Publish.</span>
      </h2>
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
        Floating content editor with animated UI across all locations.
      </p>
    </div>

    <div className="relative rounded-3xl border border-border bg-card/50 backdrop-blur-xl p-8 overflow-hidden">
      {/* Content Tabs */}
      <div className="border-b border-primary/20 mb-6">
        <div className="grid grid-cols-4 gap-2 border-b-2 border-primary/50">
          <button className="rounded-t-lg py-2 px-4 text-sm font-medium border border-primary/20 bg-primary/5 text-primary">Standard Post</button>
          <button className="rounded-t-lg py-2 px-4 text-sm font-medium border border-primary/20 bg-primary/5 transition-colors hover:bg-primary/10">Offer</button>
          <button className="rounded-t-lg py-2 px-4 text-sm font-medium border border-primary/20 bg-primary/5 transition-colors hover:bg-primary/10">Event</button>
          <button className="rounded-t-lg py-2 px-4 text-sm font-medium border border-primary/20 bg-primary/5 transition-colors hover:bg-primary/10">More</button>
        </div>
      </div>

      {/* Post Editor */}
      <div className="space-y-6">
        {/* Standard Post */}
        <div className="rounded-2xl bg-card/50 backdrop-blur-sm p-6 border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-primary/20">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-bold text-lg mb-2">Event Title</h3>
              <p className="text-muted-foreground text-sm">Grand Opening Event</p>
            </div>
            <div>
              <select className="w-full rounded-lg border border-border px-3 py-2 bg-primary/5 text-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option>Standard</option>
                <option>Offer</option>
                <option>Event</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Call to Action</label>
              <input type="text" className="w-full rounded-lg border border-border px-3 py-2 bg-primary/5 text-white focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Learn More" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">Start Date</label>
              <input type="date" className="w-full rounded-lg border border-border px-3 py-2 bg-primary/5 text-white focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">End Date</label>
              <input type="date" className="w-full rounded-lg border border-border px-3 py-2 bg-primary/5 text-white focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 rounded-lg px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-medium transition-colors hover:shadow-lg hover:shadow-purple-500/25">Publish</button>
            <button className="rounded-lg px-4 py-2 bg-white/10 text-white text-sm transition-colors hover:bg-white/20">Save Draft</button>
          </div>
        </div>

        {/* Posts Status */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="rounded-2xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 p-4 backdrop-blur-sm border border-primary/20 text-center">
            <div className="text-2xl font-bold text-primary">Live</div>
            <p className="text-xs text-muted-foreground">32 posts</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 p-4 backdrop-blur-sm border border-primary/20 text-center">
            <div className="text-2xl font-bold text-primary">Pending</div>
            <p className="text-xs text-muted-foreground">15 posts</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 p-4 backdrop-blur-sm border border-primary/20 text-center">
            <div className="text-2xl font-bold text-primary">Rejected</div>
            <p className="text-xs text-muted-foreground">5 posts</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

/* Scroll trigger animation */'''

new_content = re.sub(pattern, replacement, content)

# Write back
with open('C:/Users/Admin/Documents/Default Project/frontend/src/app/adtarbo/page.tsx', 'w') as f:
    f.write(new_content)

print('File updated successfully')