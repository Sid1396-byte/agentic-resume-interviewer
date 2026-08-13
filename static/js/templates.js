const templates = {
    clean_minimalist: `
        <div style="font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; width: 794px; height: 1122px; overflow: hidden; box-sizing: border-box; background: white; margin: 0 auto; padding: 25px 35px; color: #333; line-height: 1.3;">
            <style> strong, b { font-weight: bold !important; color: #000; } ul { list-style-type: disc !important; margin-left: 20px !important; margin-top: 3px !important; margin-bottom: 5px !important; } li { margin-bottom: 3px !important; } </style>
            <header style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px;">
                <h1 id="tpl-name" style="font-size: 28px; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 5px 0; color: #111;">[Name]</h1>
                <p id="tpl-title" style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin: 0 0 8px 0;">[Job Title]</p>
                <div id="tpl-contact" style="font-size: 11px; display: flex; justify-content: center; gap: 15px; color: #555;"></div>
            </header>
            
            <section id="tpl-section-summary" style="margin-bottom: 15px;">
                <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin-bottom: 8px;">About Me</h2>
                <div id="tpl-summary" style="font-size: 12px; text-align: justify;"></div>
            </section>
            
            <section id="tpl-section-education" style="margin-bottom: 15px;">
                <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin-bottom: 8px;">Education</h2>
                <div id="tpl-education" style="font-size: 12px;"></div>
            </section>
            
            <section id="tpl-section-experience" style="margin-bottom: 15px;">
                <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin-bottom: 8px;">Experience</h2>
                <div id="tpl-experience" style="font-size: 12px;"></div>
            </section>
            
            <section id="tpl-section-projects" style="margin-bottom: 15px;">
                <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin-bottom: 8px;">Projects</h2>
                <div id="tpl-projects" style="font-size: 12px;"></div>
            </section>
            
            <section id="tpl-section-skills" style="margin-bottom: 15px;">
                <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin-bottom: 8px;">Skills</h2>
                <div id="tpl-skills" style="font-size: 12px;"></div>
            </section>
        </div>
    `,
    structured_iconography: `
        <div style="font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; width: 794px; height: 1122px; overflow: hidden; box-sizing: border-box; background: white; margin: 0 auto; padding: 35px; color: #2b2b2b;">
            <style> strong, b { font-weight: bold !important; color: #000; } ul { list-style-type: disc !important; margin-left: 20px !important; margin-top: 5px !important; margin-bottom: 10px !important; } li { margin-bottom: 5px !important; } </style>
            <header style="margin-bottom: 30px;">
                <h1 id="tpl-name" style="font-size: 32px; margin: 0 0 5px 0; color: #1a1a1a;">[Name]</h1>
                <p id="tpl-title" style="font-size: 16px; color: #555; margin: 0 0 15px 0;">[Job Title]</p>
                <div id="tpl-contact" style="font-size: 11px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; color: #444;"></div>
                <div id="tpl-section-summary">
                    <p id="tpl-summary" style="font-size: 12px; margin-top: 15px; line-height: 1.5;"></p>
                </div>
            </header>
            
            <section id="tpl-section-experience" style="margin-bottom: 25px;">
                <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                    <span style="background: #333; color: white; padding: 4px; border-radius: 4px; display: flex;"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></span> Experience
                </h2>
                <div id="tpl-experience" style="font-size: 12px; line-height: 1.5;"></div>
            </section>
            
            <section id="tpl-section-projects" style="margin-bottom: 25px;">
                <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                    <span style="background: #333; color: white; padding: 4px; border-radius: 4px; display: flex;"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg></span> Projects
                </h2>
                <div id="tpl-projects" style="font-size: 12px; line-height: 1.5;"></div>
            </section>
            
            <section id="tpl-section-education" style="margin-bottom: 25px;">
                <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                    <span style="background: #333; color: white; padding: 4px; border-radius: 4px; display: flex;"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg></span> Education
                </h2>
                <div id="tpl-education" style="font-size: 12px; line-height: 1.5;"></div>
            </section>
            
            <section id="tpl-section-skills" style="margin-bottom: 25px;">
                <h2 style="font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                    <span style="background: #333; color: white; padding: 4px; border-radius: 4px; display: flex;"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></span> Skills
                </h2>
                <div id="tpl-skills" style="font-size: 12px; line-height: 1.5;"></div>
            </section>
        </div>
    `,
    teal_sidebar: `
        <div style="font-family: \'Open Sans\', sans-serif; display: flex; width: 794px; height: 1122px; overflow: hidden; box-sizing: border-box; margin: 0 auto; background: white;">
            <style> strong, b { font-weight: bold !important; color: #000; } ul { list-style-type: disc !important; margin-left: 20px !important; margin-top: 5px !important; margin-bottom: 10px !important; } li { margin-bottom: 5px !important; } </style>
            <div style="width: 35%; height: 100%; background: #0f766e; color: white; padding: 35px 20px; box-sizing: border-box;">
                <h1 id="tpl-name" style="font-size: 28px; margin: 0 0 5px 0; line-height: 1.2;">[Name]</h1>
                <p id="tpl-title" style="font-size: 14px; margin: 0 0 20px 0; opacity: 0.9;">[Job Title]</p>
                
                <div style="margin-bottom: 30px;">
                    <h3 style="font-size: 14px; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px; margin-bottom: 10px;">Contact</h3>
                    <div id="tpl-contact" style="font-size: 11px; display: flex; flex-direction: column; gap: 8px;"></div>
                </div>
                
                <div id="tpl-section-skills" style="margin-bottom: 30px;">
                    <h3 style="font-size: 14px; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px; margin-bottom: 10px;">Skills</h3>
                    <div id="tpl-skills" style="font-size: 11px; line-height: 1.6;"></div>
                </div>
                
                <div id="tpl-section-education" style="margin-bottom: 30px;">
                    <h3 style="font-size: 14px; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px; margin-bottom: 10px;">Education</h3>
                    <div id="tpl-education" style="font-size: 11px; line-height: 1.6;"></div>
                </div>
            </div>
            
            <div style="width: 65%; padding: 40px; color: #333;">
                <section id="tpl-section-summary" style="margin-bottom: 30px;">
                    <h2 style="font-size: 16px; color: #0f766e; text-transform: uppercase; border-bottom: 2px solid #0f766e; padding-bottom: 5px; margin-bottom: 15px;">Summary</h2>
                    <div id="tpl-summary" style="font-size: 12px; line-height: 1.6;"></div>
                </section>
                
                <section id="tpl-section-experience" style="margin-bottom: 30px;">
                    <h2 style="font-size: 16px; color: #0f766e; text-transform: uppercase; border-bottom: 2px solid #0f766e; padding-bottom: 5px; margin-bottom: 15px;">Experience</h2>
                    <div id="tpl-experience" style="font-size: 12px; line-height: 1.6;"></div>
                </section>
                
                <section id="tpl-section-projects">
                    <h2 style="font-size: 16px; color: #0f766e; text-transform: uppercase; border-bottom: 2px solid #0f766e; padding-bottom: 5px; margin-bottom: 15px;">Projects</h2>
                    <div id="tpl-projects" style="font-size: 12px; line-height: 1.6;"></div>
                </section>
            </div>
        </div>
    `,
    rust_red_accent: `
        <div style="font-family: 'Times New Roman', Times, serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #222;">
            <style> strong, b { font-weight: bold !important; color: #000; } ul { list-style-type: disc !important; margin-left: 20px !important; margin-top: 5px !important; margin-bottom: 10px !important; } li { margin-bottom: 5px !important; } </style>
            <header style="text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 20px; margin-bottom: 20px;">
                <h1 id="tpl-name" style="font-size: 32px; color: #8b3a3a; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0;">[Name]</h1>
                <p id="tpl-title" style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #555; margin: 0;">[Job Title]</p>
            </header>
            
            <div style="display: flex; gap: 30px;">
                <div style="width: 35%;">
                    <section id="tpl-section-contact" style="margin-bottom: 25px;">
                        <h2 style="font-size: 14px; color: #8b3a3a; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 10px;">Contact</h2>
                        <div id="tpl-contact" style="font-size: 11px; display: flex; flex-direction: column; gap: 5px; color: #444;"></div>
                    </section>
                    
                    <section id="tpl-section-skills" style="margin-bottom: 25px;">
                        <h2 style="font-size: 14px; color: #8b3a3a; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 10px;">Skills</h2>
                        <div id="tpl-skills" style="font-size: 11px; line-height: 1.5;"></div>
                    </section>
                    
                    <section id="tpl-section-education" style="margin-bottom: 25px;">
                        <h2 style="font-size: 14px; color: #8b3a3a; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 10px;">Education</h2>
                        <div id="tpl-education" style="font-size: 11px; line-height: 1.5;"></div>
                    </section>
                </div>
                
                <div style="width: 65%;">
                    <section id="tpl-section-summary" style="margin-bottom: 25px;">
                        <h2 style="font-size: 14px; color: #8b3a3a; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 10px;">Objective</h2>
                        <div id="tpl-summary" style="font-size: 12px; line-height: 1.5; text-align: justify;"></div>
                    </section>
                    
                    <section id="tpl-section-experience" style="margin-bottom: 25px;">
                        <h2 style="font-size: 14px; color: #8b3a3a; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 10px;">Experience</h2>
                        <div id="tpl-experience" style="font-size: 12px; line-height: 1.5;"></div>
                    </section>
                    
                    <section id="tpl-section-projects" style="margin-bottom: 25px;">
                        <h2 style="font-size: 14px; color: #8b3a3a; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 10px;">Projects</h2>
                        <div id="tpl-projects" style="font-size: 12px; line-height: 1.5;"></div>
                    </section>
                </div>
            </div>
        </div>
    `,
    cse_academic: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #000;">
            <style> strong, b { font-weight: bold !important; color: #000; } ul { list-style-type: disc !important; margin-left: 20px !important; margin-top: 5px !important; margin-bottom: 10px !important; } li { margin-bottom: 5px !important; } </style>
            <header style="margin-bottom: 20px;">
                <h1 id="tpl-name" style="font-size: 28px; color: #1e5b82; margin: 0 0 10px 0; font-weight: normal;">[Name]</h1>
                <div id="tpl-contact" style="font-size: 11px; display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px;"></div>
                <div style="border-bottom: 3px solid #333; margin-bottom: 2px;"></div>
                <div style="border-bottom: 1px solid #ccc;"></div>
            </header>
            
            <section id="tpl-section-summary" style="margin-bottom: 20px;">
                <h2 style="font-size: 18px; color: #1e5b82; margin: 0 0 10px 0;">Career Objective</h2>
                <div id="tpl-summary" style="font-size: 13px; line-height: 1.5; text-align: justify; border-bottom: 1px solid #000; padding-bottom: 15px;"></div>
            </section>
            
            <section id="tpl-section-education" style="margin-bottom: 20px;">
                <h2 style="font-size: 18px; color: #1e5b82; margin: 0 0 10px 0;">Education</h2>
                <div id="tpl-education" style="font-size: 13px; border-bottom: 1px solid #000; padding-bottom: 15px;"></div>
            </section>
            
            <section id="tpl-section-skills" style="margin-bottom: 20px;">
                <h2 style="font-size: 18px; color: #1e5b82; margin: 0 0 10px 0;">Technical Skills</h2>
                <div id="tpl-skills" style="font-size: 13px; border-bottom: 1px solid #000; padding-bottom: 15px;"></div>
            </section>
            
            <section id="tpl-section-experience" style="margin-bottom: 20px;">
                <h2 style="font-size: 18px; color: #1e5b82; margin: 0 0 10px 0;">Experience</h2>
                <div id="tpl-experience" style="font-size: 13px; border-bottom: 1px solid #000; padding-bottom: 15px;"></div>
            </section>
            
            <section id="tpl-section-projects" style="margin-bottom: 20px;">
                <h2 style="font-size: 18px; color: #1e5b82; margin: 0 0 10px 0;">Projects</h2>
                <div id="tpl-projects" style="font-size: 13px; border-bottom: 1px solid #000; padding-bottom: 15px;"></div>
            </section>
        </div>
    `
};

export default templates;
