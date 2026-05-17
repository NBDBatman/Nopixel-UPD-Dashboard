@extends('layouts.app')

@section('title', 'Court')

@section('content')
<div class="page active">
  <div class="page-header"><h1><i class="fa-solid fa-landmark"></i> Court Procedures</h1><span class="ph-sub">Trial flow and objection reference</span></div>
  <div class="page-content">
    <div class="court-book">
      <section class="court-stages">
        <div class="court-column-title"><i class="fa-solid fa-route"></i> Trial Flow</div>
        <div class="court-stage-grid">
          <div class="court-stage"><span>01</span><strong>Discovery</strong><small>Not used in Bench Trial.</small></div>
          <div class="court-stage"><span>02</span><strong>Pre-Trial Motions</strong><small>Resolve legal issues before trial begins.</small></div>
          <div class="court-stage"><span>03</span><strong>Opening Statements</strong><small>Bench Trial only if the judge allows it.</small></div>
          <div class="court-stage"><span>04</span><strong>Prosecution</strong><small>Witnesses and evidence from the prosecution side.</small></div>
          <div class="court-stage"><span>05</span><strong>Defense</strong><small>Witnesses and evidence from the defense side.</small></div>
          <div class="court-stage"><span>06</span><strong>Closing Statements</strong><small>Bench Trial only if the judge allows it.</small></div>
          <div class="court-stage"><span>07</span><strong>Deliberation</strong><small>Judge or jury reviews the record.</small></div>
          <div class="court-stage"><span>08</span><strong>Judgement or Verdict</strong><small>The final decision is issued.</small></div>
          <div class="court-stage"><span>09</span><strong>Post-Trial Motions</strong><small>Follow-up motions after judgement.</small></div>
        </div>
      </section>
      <section class="court-reference">
        <div class="court-column">
          <div class="court-column-title"><i class="fa-solid fa-clipboard-list"></i> Courtroom Checklist</div>
          <div class="court-row"><strong>Respect</strong><span>Always be respectful to the judge.</span></div>
          <div class="court-row"><strong>Etiquette</strong><span>Do not enforce it yourself. That is the judge's job.</span></div>
          <div class="court-row"><strong>Custody</strong><span>Check with the judge before uncuffing the suspect. Make the suspect aware of the consequences of fleeing.</span></div>
          <div class="court-row"><strong>Seating</strong><span>Police normally sit prosecution on the right side.</span></div>
          <div class="court-row"><strong>Witnesses</strong><span>Only introduce witnesses with relevant information.</span></div>
        </div>
        <div class="court-column">
          <div class="court-column-title"><i class="fa-solid fa-folder-open"></i> Presenting the Case</div>
          <div class="court-row"><strong>Proof</strong><span>Present proof for charges directly.</span></div>
          <div class="court-row"><strong>Evidence</strong><span>Introduce every relevant piece for either side, including Brady material.</span></div>
          <div class="court-row"><strong>Reports</strong><span>Highlight evidence in the report that proves the charges.</span></div>
          <div class="court-row"><strong>Record</strong><span>Link relevant reports, incidents, and useful statements.</span></div>
          <div class="court-row"><strong>Witness Cap</strong><span>Max 2 witnesses per side unless approved by the judge.</span></div>
        </div>
        <div class="court-column court-accent">
          <div class="court-column-title"><i class="fa-solid fa-scale-balanced"></i> Examination Rules</div>
          <div class="court-row"><strong>Objections</strong><span>Remind witnesses to wait 4 seconds after a question.</span></div>
          <div class="court-row"><strong>Cross</strong><span>Leading the witness toward a specific answer is allowed.</span></div>
          <div class="court-row"><strong>Direct</strong><span>Avoid leading questions unless the judge permits it.</span></div>
          <div class="court-row"><strong>Extra Witnesses</strong><span>Use depositions or written statements only with approval.</span></div>
        </div>
      </section>
      <section class="court-objections">
        <div class="court-column-title"><i class="fa-solid fa-ban"></i> Objection Reference</div>
        <div class="obj-grid">
          <div class="obj"><strong>Leading</strong> — The question suggests an answer in any fashion.</div>
          <div class="obj"><strong>Compound</strong> — Two different factors asked in the same question.</div>
          <div class="obj"><strong>Calls for Narrative</strong> — Question calls for unnecessary narrative, or witness gives an overly long answer.</div>
          <div class="obj"><strong>Argumentative</strong> — Question poses an argument rather than requesting testimony.</div>
          <div class="obj"><strong>Asked and Answered</strong> — Same question asked again after witness already answered.</div>
          <div class="obj"><strong>Vague</strong> — Question or answer is not pointed or direct enough to be correctly interpreted.</div>
          <div class="obj"><strong>Non-responsive</strong> — Witness deflects with superficial information or doesn't answer.</div>
          <div class="obj"><strong>Relevance</strong> — Question or answer has no material fact to the litigation.</div>
          <div class="obj"><strong>Lack Foundation</strong> — Missing key material fact that must be established first.</div>
          <div class="obj"><strong>Speculation</strong> — Calls upon the witness to testify beyond their personal knowledge.</div>
          <div class="obj"><strong>Creation of Material Fact</strong> — Error in testimony, or information beyond the witness's scope is requested.</div>
          <div class="obj"><strong>Opinion of a Layperson</strong> — Witness not qualified to answer in an expert capacity.</div>
          <div class="obj"><strong>Hearsay</strong> — Witness asked to testify about statements of another person not on the stand.</div>
          <div class="obj"><strong>General</strong> — General objection; judge will request further clarification.</div>
          <div class="obj"><strong>Scope</strong> — Question asked outside the line of direct or cross-examination.</div>
          <div class="obj"><strong>Badgering</strong> — Attorney makes statements to emotionally unbalance the witness.</div>
          <div class="obj"><strong>No Question</strong> — No question present in the counselor's statement.</div>
          <div class="obj"><strong>Counsel is Testifying</strong> — Counselor offering their own testimony within the question.</div>
          <div class="obj"><strong>Facts Not in Evidence</strong> — Facts not admitted into evidence used as basis for a question.</div>
          <div class="obj"><strong>Calls for Conclusion</strong> — Question asks for an opinion rather than facts.</div>
          <div class="obj"><strong>Nothing Pending</strong> — Witness continues speaking on irrelevant matters. Use very sparingly.</div>
        </div>
      </section>
    </div>
  </div>
</div>
@endsection