@extends('layouts.app')

@section('title', 'Constitution')

@section('content')
<div class="page active">
  <div class="page-header"><h1><i class="fa-solid fa-scroll"></i> Constitution of San Andreas</h1><span class="ph-sub">Articles, authorities, and rights</span></div>
  <div class="page-content">
    <div class="constitution-doc">
      <section class="constitution-summary">
        <div><strong>4 Articles</strong><span>Governance, authority, rights, and social services.</span></div>
        <div><strong>Supreme Law</strong><span>The Constitution controls the legal framework of San Andreas.</span></div>
        <div><strong>Rights Focused</strong><span>Article III contains the core citizen protections.</span></div>
      </section>
      <article class="constitution-section">
        <div class="constitution-section-head"><span>Article I</span><strong>Governance and Law</strong></div>
        <div class="constitution-rows">
          <div><strong>Supremacy of the Constitution</strong><span>The San Andreas Constitution is the supreme law of the land.</span></div>
          <div><strong>Obligation to Obey</strong><span>All citizens must adhere to the principles and laws set forth in this document.</span></div>
          <div><strong>Duty to Pay Taxes</strong><span>Citizens have a duty to pay taxes.</span></div>
        </div>
      </article>
      <article class="constitution-section">
        <div class="constitution-section-head"><span>Article II</span><strong>Legislative Authorities</strong></div>
        <div class="constitution-authorities">
          <div><strong>DOJ</strong><span>Legislative authority over all legal and judicial matters within San Andreas. Ensures enforcement of laws, upholds justice, and protects citizens' rights. Precedents set by Justices act as Common Law. Also responsible for preserving the integrity and safety of the State, the Constitution, citizens' rights, and the laws of the State.</span></div>
          <div><strong>Blaine County</strong><span>Legislative authority over its jurisdiction, responsible for governance, public services, and local laws pertaining to residents and operations within Blaine County. The Blaine County Mayor governs the County's laws; the Blaine County Sheriff's Office is responsible for public services. The Sheriff is appointed by the Blaine County Mayor.</span></div>
          <div><strong>Los Santos County</strong><span>Legislative authority over its jurisdiction, responsible for governance, public services, and local laws pertaining to residents and operations within Los Santos. The Los Santos County Mayor governs Los Santos's laws; the LSPD is responsible for public services. The Chief of Police is appointed by the Los Santos County Mayor.</span></div>
          <div><strong>SAMA</strong><span>San Andreas adheres to healthcare standards established by medical professionals. One currently active medical professional is publicly elected to oversee the medical authority, representing all medical factions alongside their High Command. The authority consists solely of active medical professionals — doctors or mental health professionals employed by the San Andreas Medical Group or Emergency Medical Services. This authority guides health legislation and represents all medical factions fairly.</span></div>
        </div>
        <div class="constitution-sub">Jurisdictions &amp; Administration</div>
        <div class="constitution-rows">
          <div><strong>Territorial Waters &amp; Islands</strong><span>The waters and islands surrounding the mainland are under shared State Jurisdiction. Waters and islands within a twenty-mile radius of the island are State territory if not designated on the map. The State may add or amend jurisdictions as needed, including any newly discovered land.</span></div>
          <div><strong>Air Jurisdiction</strong><span>Air is governed by the jurisdiction it is above, up to 10 miles. Anything above this limit is under authority of the State of San Andreas.</span></div>
          <div><strong>Undesignated Territory</strong><span>Areas undesignated to a specific jurisdiction are de facto State property. All municipalities have equal law enforcement powers on said territory.</span></div>
          <div><strong>State-wide Laws</strong><span>If both Blaine County and Los Santos agree on a locally established law, it will be developed as a state-wide law.</span></div>
          <div><strong>Elected Terms</strong><span>The Blaine County Mayor, Los Santos County Mayor, and the SAMA elected official each hold office for a three (3) month term before elections are held again.</span></div>
          <div><strong>DOJ Administration</strong><span>The DOJ publishes and administers all public ballot measures, votes, elections, and referendums. The DOJ is also responsible for verifying election results and appointing public officials into their offices.</span></div>
        </div>
      </article>
      <article class="constitution-section">
        <div class="constitution-section-head"><span>Article III</span><strong>Rights and Freedoms</strong></div>
        <div class="constitution-rights">
          <div><strong>Right to Assemble</strong><span>Citizens are free to assemble peacefully, provided it does not hinder the rights of others.</span></div>
          <div><strong>Right to Free Speech and Thought</strong><span>Citizens are free to express their thoughts and beliefs without censorship or coercion.</span></div>
          <div><strong>Right to Dignity</strong><span>All citizens shall be treated equally and with respect, free from discrimination.</span></div>
          <div><strong>Right to Information</strong><span>Citizens have the right to access public information necessary for their well-being.</span></div>
          <div><strong>Right to Vote &amp; Petition</strong><span>Citizens have the right to present requests, grievances, and proposals to their government.</span></div>
          <div><strong>Right to a Fair Trial and Due Process</strong><span>All citizens are guaranteed a fair trial and due process of law.</span></div>
          <div><strong>Right to Privacy</strong><span>Citizens have the right to personal privacy and protection from unwarranted disclosure of private information.</span></div>
          <div><strong>Right to Health and Protection of Others</strong><span>Citizens have the right to health services and the right to protect themselves and others within reason.</span></div>
          <div><strong>Right to Property</strong><span>Citizens have the right to own material possessions and land, provided it does not infringe on others and their rights.</span></div>
        </div>
      </article>
      <article class="constitution-section">
        <div class="constitution-section-head"><span>Article IV</span><strong>Social Services</strong></div>
        <div class="constitution-rows">
          <div><strong>Right to Healthcare</strong><span>All citizens are eligible for subsidized emergency healthcare, including mental health services.</span></div>
          <div><strong>Right to Free Housing</strong><span>Citizens are entitled to free housing provided by the state, starting with the apartments in Little Seoul.</span></div>
          <div><strong>Right to Bear Arms</strong><span>Citizens with a legal civilian weapons license have the right to bear firearms. No license is needed for melee weapons.</span></div>
        </div>
      </article>
    </div>
  </div>
</div>
@endsection