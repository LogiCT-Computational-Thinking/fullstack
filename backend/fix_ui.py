import os

path = r'c:\Users\Acer\Documents\LogiCT\frontend\src\pages\AdminMaterials.jsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
found = False
for i, line in enumerate(lines):
    # Search for the quiz visibility toggle button which we just edited
    if 'button onClick={() => setQuizVisibility(!quizVisibility)}' in line:
        found = True
        # Keep this line
        new_lines.append(line)
        # Scan forward for the closing div
        j = i + 1
        while j < len(lines) and '</div>' not in lines[j]:
            new_lines.append(lines[j])
            j += 1
        
        if j < len(lines):
            # Add the closing div
            new_lines.append(lines[j])
            # Insert our new content
            new_lines.append("\n")
            new_lines.append("                                 {/* Quiz Dates Settings */}\n")
            new_lines.append("                                 <div className=\"grid grid-cols-2 gap-3 mt-2\">\n")
            new_lines.append("                                     <div>\n")
            new_lines.append("                                         <label className=\"block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1\">Start Date</label>\n")
            new_lines.append("                                         <input \n")
            new_lines.append("                                            type=\"datetime-local\" \n")
            new_lines.append("                                            value={quizStartDate}\n")
            new_lines.append("                                            onChange={(e) => setQuizStartDate(e.target.value)}\n")
            new_lines.append("                                            className=\"w-full px-3 py-2 border border-gray-100 rounded-xl text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-purple-50\"\n")
            new_lines.append("                                         />\n")
            new_lines.append("                                     </div>\n")
            new_lines.append("                                     <div>\n")
            new_lines.append("                                         <label className=\"block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1\">Deadline</label>\n")
            new_lines.append("                                         <input \n")
            new_lines.append("                                            type=\"datetime-local\" \n")
            new_lines.append("                                            value={quizDeadline}\n")
            new_lines.append("                                            onChange={(e) => setQuizDeadline(e.target.value)}\n")
            new_lines.append("                                            className=\"w-full px-3 py-2 border border-gray-100 rounded-xl text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-purple-50\"\n")
            new_lines.append("                                         />\n")
            new_lines.append("                                     </div>\n")
            new_lines.append("                                 </div>\n")
            new_lines.append("\n")
            new_lines.append("                                 <button \n")
            new_lines.append("                                    onClick={handleSaveQuizSettings}\n")
            new_lines.append("                                    disabled={isSavingQuizSettings}\n")
            new_lines.append("                                    className=\"w-full mt-2 py-2.5 bg-purple-600 text-white text-[12px] font-black rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-100\"\n")
            new_lines.append("                                 >\n")
            new_lines.append("                                     {isSavingQuizSettings ? <Loader2 className=\"w-3 h-3 animate-spin\" /> : <CheckCircle2 className=\"w-3 h-3\" />}\n")
            new_lines.append("                                     Simpan Pengaturan Kuis\n")
            new_lines.append("                                 </button>\n")
        
        # Skip the original lines we've already processed or intended to replace
        # Wait, the loop will continue from i+1. But we processed up to j.
        # However, it's easier to just skip the next lines until j.
        # But we can't easily skip in a simple for loop unless we use an iterator.
        # Let's just fix the loop.
        pass
    else:
        # Check if we should skip lines between i and j? 
        # Actually, let's use a simpler approach.
        new_lines.append(line)

# Wait, the simple logic above might double lines because 'found' isn't used to skip.
# Let's rewrite the script to be more robust.

content = "".join(lines)
anchor = 'button onClick={() => setQuizVisibility(!quizVisibility)}'
if anchor in content:
    # Find the next </div>
    idx = content.find(anchor)
    div_idx = content.find('</div>', idx)
    if div_idx != -1:
        insert_idx = div_idx + 6 # length of </div>
        new_content = content[:insert_idx] + """
                                 {/* Quiz Dates Settings */}
                                 <div className="grid grid-cols-2 gap-3 mt-2">
                                     <div>
                                         <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Start Date</label>
                                         <input 
                                            type="datetime-local" 
                                            value={quizStartDate}
                                            onChange={(e) => setQuizStartDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-100 rounded-xl text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-purple-50"
                                         />
                                     </div>
                                     <div>
                                         <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Deadline</label>
                                         <input 
                                            type="datetime-local" 
                                            value={quizDeadline}
                                            onChange={(e) => setQuizDeadline(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-100 rounded-xl text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-purple-50"
                                         />
                                     </div>
                                 </div>

                                 <button 
                                    onClick={handleSaveQuizSettings}
                                    disabled={isSavingQuizSettings}
                                    className="w-full mt-2 py-2.5 bg-purple-600 text-white text-[12px] font-black rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-100"
                                 >
                                     {isSavingQuizSettings ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                     Simpan Pengaturan Kuis
                                 </button>""" + content[insert_idx:]
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Success")
    else:
        print("Closing div not found")
else:
    print("Anchor not found")
