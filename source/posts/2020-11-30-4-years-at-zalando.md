---
title: 4 years at Zalando
tags: []
image: /images/2020-spree.jpg
---

![Spree in November, 2020](/images/2020-spree.jpg)

I’m leaving Zalando with fond memories after 4 years. Here I’m writing down my experience. It’s never comprehensive, but I hope some people find it interesting!

## Beginning

I had lived mostly in Japan for 34 years until 2016. I wanted to travel more, but I was lazy. I decided to work abroad so that I could travel while earning money.

A job-matching website called [Honeypot](https://www.honeypot.io/) introduced me to Zalando. I had 5 interviews and got an offer for Senior Software Engineer (Frontend). I accepted the offer without looking into any other companies because I liked the interviewers and the company’s OSS projects looked interesting. (Honeypot was very happy about it. They put me on their top page and [an interview blog post](https://blog.honeypot.io/japanese-developer-in-berlin/).)

I moved from Tokyo to Berlin and joined Zalando in October 2016. With 200 other newbies in a month! Zalando is a fashion e-commerce company that sells shoes, clothes, etc. on its website. I had no clue why they needed so many people at the beginning. Isn’t it a website in the end? I later learned that the visible part of the website was the tip of the iceberg. There were many more areas like wholesale, brand relationship, pricing, warehouse management, shipping, payment, and so on.

## Team(s)

In 2016, Zalando was hiring software engineers with _pool hiring_. We were hired without specific teams to join. After a month of onboarding, each newbie was offered two departments to choose from. I chose the Catalog and Navigation team in the Fashion Store, the e-commerce website of Zalando.

For the first few months, I thought that the company was providing free beer to employees because fridges were always full of beer bottles even if we drank them a couple of times a week. I later learned that the beer was provided by the delivery lead and the product owner of the team. I joined the right team.

Aside from the beer, I liked the team. We worked together and played together. It was multi-cultural and magically bonded. It was an old team, but several members including me joined the team in late 2016. We learned the German language and explored the city of Berlin. We had BBQs in a park and drank vodka playing games in the office. It felt like a youth again. Some of the teammates were actually young. After two years or so, we stopped drinking as much as we did. We all became grown-ups...? Maybe.

Through re-organizations, the shape of the team has changed. It was split into multiple teams. Some people left and new people joined. But I stayed in the same area more or less.

## Frontend engineer...?

At Zalando, frontend engineers were more like JavaScript fullstack engineers.

In 2016, Zalando had a slogan, _Radical Agility_. It promoted team autonomy and Microservices to support it. Each engineering team was supposed to operate what they built on top of the [STUPS](https://stups.io/) infrastructure. Frontend was not an exception. [Mosaic](https://www.mosaic9.org/) (frontend-microservices architecture) allowed each product team to own their Node.js servers for data aggregation and React server-side rendering in addition to frontend components.

The team’s responsibilities were broad. Building new features and UI improvements with A/B testing, contributing to shared UI components, web performance optimization, Node.js server operations, 24x7 on-call, writing post mortems, and so on.

In [the new architecture that the Fashion Store is moving to](https://engineering.zalando.com/posts/2018/12/front-end-micro-services.html), product teams don’t need to maintain Node.js servers. I would miss the burden, but I think it’s a good thing.

## Operation and reliability

I had a good opportunity to work on Node.js servers with serious traffic and business impact. Before joining Zalando, I had worked only on products that didn’t take off or were just taking off. I didn’t have much experience in scaling, monitoring, etc. But writing post mortems became one of my favorite activities after 4 years.

When my team migrated one of Zalando’s most frequently visited pages to the microservice architecture, our journey in this area started. Even among frontend engineers in the team, some of them were frontendy—good at UI—and some of them were backendy. I was a backendy one and started looking into the topic. I found it interesting. It was a nice way to contribute to the team and the business.

I glimpsed SRE initiatives and Cyber Week preparation being set up and evolving. [How Zalando prepares for Cyber Week](https://engineering.zalando.com/posts/2020/10/how-zalando-prepares-for-cyber-week.html) is a great overview of the evolution. I had a good chance to take part in it as a member of a product team. The people who formed the SRE team taught us monitoring, alerting, and reliability patterns (retry, circuit breaker, fallback, etc.). Incident response and post mortems were standardized. Then distributed tracing and [adaptive paging](https://www.usenix.org/conference/srecon19emea/presentation/mineiro) were introduced.

Some of my contributions were reliability improvements of Node.js services. I researched [timeout mechanisms of Node.js HTTP client](<(/blog/2017/05/13/http-request-timeouts-in-javascript/)>) and added a timeout feature to [an HTTP client library](https://github.com/zalando-incubator/perron). [Built a mitigation strategy for DNS timeouts](/blog/2019/04/30/dns-polling/), [improved histogram metrics aggregation](/blog/2018/12/29/histogram-for-time-series-metrics-on-node-js/), [performed profiling and found interesting findings](/blog/2018/09/16/node-js-under-a-microscope/)—I had a chance to talk about it in front of a big audience including TC39 folks... I was nervous!

I was late to the Kubernetes train. The migration from STUPS to Kubernetes didn’t get enough priority in my team. On the other hand, Zalando was an early adapter of Kubernetes and has been [a strong contributor to the ecosystem](https://www.cncf.io/announcements/2020/08/20/cloud-native-computing-foundation-grants-zalando-the-top-end-user-award/). I missed a good learning opportunity to dive into it and learn from the in-house experts.

## Web performance

Another topic that I enjoyed was web performance optimization. It was especially rewarding because it directly contributes to customer experience and the e-commerce business. After my team worked on it, I had an opportunity to write a part of [a blog post about the improvements](https://engineering.zalando.com/posts/2018/06/loading-time-matters.html).

This topic keeps evolving. New metrics like [Web Vitals](https://web.dev/vitals/) and more measurement/optimization techniques came out. It is one of the topics that I would want to pursue if I remained at Zalando.

## Cross-team collaboration

I had a chance to work with many other teams in the Fashion Store and other departments. I met and worked with literally hundreds of colleagues. I had never worked with so many people before joining Zalando.

That meant more meetings and alignments. I learned decision making with writing. I still don’t say that I’m good at it, but Google Docs became my favorite editor next to Vim.

I learned that it can be fun to work with many teams. Sometimes it was frustrating because of the time consumed. But it was rewarding to meet with many colleagues and work together.

## Career

I saw good examples of career paths. Before joining Zalando, I imagined only two paths for software engineers. Staying as a senior engineer (or a lead engineer) or becoming a manager. It was great to see another path, being a senior individual contributor who takes technical leadership. At Zalando, it’s called Principal Engineer. In addition to technically leading projects, they shape the tech landscape of the company beyond the scope of a team.

I was fortunate enough to be promoted to a principal engineer this year. A new role gave me new tasks and a new point of view. It’s one of my regrets to leave this role prematurely.

## Fun

I had a lot of fun.

Lunch tours to Schlesisches Tor. Countless drinks at the office. After-drink burgers at Burgermeister. A team event on canoes. Summer BBQs in a park. Company parties with thousands of people and getting lost. _Mett_ —German traditional breakfast of minced raw pork—with some beer in the office at 11 am. Ordering _Maß_ at lunch and learning what it meant when 1L of beer arrived...

## Next

It’s been a fun journey. I’m grateful for all the opportunities and learnings. If I went back to 2016, I would do it again.

I’m going to start a new job tomorrow. I hope it will be fun as well!
