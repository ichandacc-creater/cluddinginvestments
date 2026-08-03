from pathlib import Path
p = Path('projects.html')
s = p.read_text(encoding='utf-8')
norm = s.replace('\r\n', '\n')
start = norm.find('<div class="brochure-layout">')
if start == -1:
    print('START_NOT_FOUND')
    raise SystemExit(1)
end = norm.find('</section>', start)
if end == -1:
    print('END_NOT_FOUND')
    raise SystemExit(1)
end += len('</section>')
new_section = '''<section class="work-slider-section">
      <div class="container">
        <div class="work-slider-header">
          <div>
            <span class="hero-intro">OUR WORK</span>
            <h2>Projects that slide through our capabilities</h2>
            <p>Explore our most representative work in a smooth, Blink-style slider experience.</p>
          </div>
          <div class="slider-controls-top">
            <button class="slider-control prev" aria-label="Previous project"><i class="fas fa-chevron-left"></i></button>
            <button class="slider-control next" aria-label="Next project"><i class="fas fa-chevron-right"></i></button>
          </div>
        </div>

        <div class="work-slider">
          <div class="slider-window">
            <div class="slider-track">
              <div class="slider-slide">
                <article class="project-card brochure-feature" id="nsobe-project" data-category="education laboratory">
                  <div class="project-image-wrapper">
                    <img src="images/Nsobe%20project%20(1).jpg" alt="Nsobe project" class="project-main">
                    <div class="project-overlay">
                      <div class="overlay-content">
                        <h3>Science Lab — Nsobe</h3>
                        <p>Complete laboratory installation</p>
                      </div>
                    </div>
                  </div>
                  <div class="card-body brochure-body">
                    <div class="project-header">
                      <div>
                        <h3>Science Lab — Nsobe</h3>
                        <span class="project-category">Education & Laboratory</span>
                      </div>
                      <div class="project-stats">
                        <span class="stat"><i class="fas fa-images"></i> 10+</span>
                      </div>
                    </div>
                    <p>Complete laboratory installation with modern fittings and safety equipment. State-of-the-art facilities for scientific research and education.</p>
                    <div class="thumbs brochure-thumbs">
                      <a href="nsobe.html?img=images/Nsobe%20project%20(1).jpg"><img src="images/Nsobe%20project%20(1).jpg" alt="Nsobe 1" data-full="images/Nsobe%20project%20(1).jpg" class="active"></a>
                      <a href="nsobe.html?img=images/Nsobe%20project%20(2).jpeg"><img src="images/Nsobe%20project%20(2).jpeg" alt="Nsobe 2" data-full="images/Nsobe%20project%20(2).jpeg"></a>
                      <a href="nsobe.html?img=images/Nsobe%20project%20(3).jpeg"><img src="images/Nsobe%20project%20(3).jpeg" alt="Nsobe 3" data-full="images/Nsobe%20project%20(3).jpeg"></a>
                      <a href="nsobe.html?img=images/Nsobe%20project%20(4).jpeg"><img src="images/Nsobe%20project%20(4).jpeg" alt="Nsobe 4" data-full="images/Nsobe%20project%20(4).jpeg"></a>
                      <a href="nsobe.html?img=images/Nsobe%20project%20(5).jpeg"><img src="images/Nsobe%20project%20(5).jpeg" alt="Nsobe 5" data-full="images/Nsobe%20project%20(5).jpeg"></a>
                    </div>
                    <div class="card-actions">
                      <a href="nsobe.html" class="btn">View Gallery</a>
                      <a href="contact.html" class="btn secondary">Request Quote</a>
                    </div>
                  </div>
                </article>
              </div>
              <div class="slider-slide">
                <article class="project-card brochure-side-card" data-category="education laboratory">
                  <div class="project-image-wrapper">
                    <img src="images/kansenshi.jpg" alt="Kansanshi Secondary School Chemistry Lab">
                    <div class="project-overlay">
                      <div class="overlay-content">
                        <h3>Chemistry Lab — Kansanshi</h3>
                        <p>Modern science facility</p>
                      </div>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="project-header">
                      <div>
                        <h3>Chemistry Lab — Kansanshi</h3>
                        <span class="project-category">Education & Laboratory</span>
                      </div>
                      <div class="project-stats">
                        <span class="stat"><i class="fas fa-check-circle"></i> Completed</span>
                      </div>
                    </div>
                    <p>Modern chemistry lab setup with functional workstations, safety systems, and equipment designed for teaching and research.</p>
                    <div class="card-actions">
                      <a href="contact.html" class="btn">Get Details</a>
                      <a href="contact.html" class="btn secondary">Request Quote</a>
                    </div>
                  </div>
                </article>
              </div>
              <div class="slider-slide">
                <article class="project-card brochure-side-card" data-category="education laboratory">
                  <div class="project-image-wrapper">
                    <img src="images/kansenshi2.jpg" alt="Kansanshi Secondary School">
                    <div class="project-overlay">
                      <div class="overlay-content">
                        <h3>Kansenshi Lab Refurbishment</h3>
                        <p>Safety and quality upgrades</p>
                      </div>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="project-header">
                      <div>
                        <h3>Kansenshi Lab Refurbishment</h3>
                        <span class="project-category">Education & Laboratory</span>
                      </div>
                      <div class="project-stats">
                        <span class="stat"><i class="fas fa-tools"></i> Refurbished</span>
                      </div>
                    </div>
                    <p>Refurbishment project with upgraded layouts, durable finishes and new electrical and plumbing installations for safer lab operations.</p>
                    <div class="card-actions">
                      <a href="contact.html" class="btn">Get Details</a>
                      <a href="contact.html" class="btn secondary">Request Quote</a>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
          <div class="slider-dots">
            <button class="slider-dot active" aria-label="Slide 1"></button>
            <button class="slider-dot" aria-label="Slide 2"></button>
            <button class="slider-dot" aria-label="Slide 3"></button>
          </div>
        </div>
      </div>
    </section>
'''
out = norm[:start] + new_section + norm[end:]
p.write_text(out.replace('\n', '\r\n'), encoding='utf-8')
print('REPLACED')
