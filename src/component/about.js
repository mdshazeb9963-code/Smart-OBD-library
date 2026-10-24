import React from 'react';
import { BrandHeader, MechanicSidebar } from './layout';
import { apiRequest, usesDatabaseApi } from './api';

export const defaultAboutText = 'Quick access to your vehicle reference library.';
export const aboutStorageKey = 'smart-obd-workshop-about';

export function getWorkshopAboutText() {
  return window.localStorage.getItem(aboutStorageKey) || defaultAboutText;
}

export async function loadWorkshopAboutText() {
  if (!usesDatabaseApi) {
    return getWorkshopAboutText();
  }
  const result = await apiRequest('/about');
  return result.content;
}

export async function saveWorkshopAboutText(content) {
  if (!usesDatabaseApi) {
    window.localStorage.setItem(aboutStorageKey, content);
    return content;
  }
  const result = await apiRequest('/about', {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
  return result.content;
}

function About() {
  const [aboutText, setAboutText] = React.useState(usesDatabaseApi ? '' : getWorkshopAboutText);
  const [draftAbout, setDraftAbout] = React.useState(aboutText);
  const [isEditing, setIsEditing] = React.useState(false);
  const [aboutError, setAboutError] = React.useState('');

  React.useEffect(() => {
    if (usesDatabaseApi) {
      loadWorkshopAboutText()
        .then((content) => {
          setAboutText(content);
          setDraftAbout(content);
        })
        .catch(() => setAboutError('Workshop information could not be loaded from the database.'));
    }
  }, []);

  const saveAbout = async (event) => {
    event.preventDefault();
    const updatedAbout = draftAbout.trim();
    try {
      const savedText = await saveWorkshopAboutText(updatedAbout);
      setAboutText(savedText);
      setIsEditing(false);
      setAboutError('');
    } catch (error) {
      setAboutError(error.message || 'Workshop information could not be saved.');
    }
  };

  return (
    <div className="app-page">
      <BrandHeader />
      <div className="workspace-layout">
        <MechanicSidebar />
        <main className="workspace-main">
          <div className="page-heading">
            <p className="eyebrow"><span className="eyebrow-line" /> WORKSHOP INFORMATION</p>
            <h1>About</h1>
            <p className="page-description">Information about your workshop.</p>
          </div>
          {aboutError && <p className="form-message" role="alert">{aboutError}</p>}
          <section className="about-panel" aria-label="About your workshop">
            {isEditing ? (
              <form className="about-page-form" onSubmit={saveAbout}>
                <label className="sr-only" htmlFor="workshop-about">Workshop about text</label>
                <textarea
                  id="workshop-about"
                  value={draftAbout}
                  onChange={(event) => setDraftAbout(event.target.value)}
                  maxLength={180}
                  required
                />
                <div className="about-panel-actions">
                  <button type="submit" disabled={!draftAbout.trim()}>Save</button>
                  <button type="button" onClick={() => {
                    setDraftAbout(aboutText);
                    setIsEditing(false);
                  }}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <p>{aboutText}</p>
                <div className="about-panel-actions">
                  <button type="button" onClick={() => {
                    setDraftAbout(aboutText);
                    setIsEditing(true);
                  }}>Edit about</button>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default About;
