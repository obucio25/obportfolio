import type { Route } from "./+types/home";
import { Outlet, Link } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { getSupabaseAdmin } from "../lib/supabase.server";
import Hero from "../components/Hero";

export async function loader({ request }: LoaderFunctionArgs) {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "header_status")
    .maybeSingle();

  return { headerStatus: data?.value ?? "Open for work"};
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Omar Bucio | Software Developer" },
    { 
      name: "description", 
      content: 
        "Portfolio of Omar Bucio, a software developer specializing in React, Node.js, Python, SQL, and full-stack web development.", 
    },
  ];
}

export default function Home() {
   return (

    <>

      <Hero />

      <section>
        <h1>Hi, I'm Omar</h1>
        <p>Full-stack developer (React, Node, MySQL, Azure).</p>

        <div>
          <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Officia, deleniti cupiditate? Minus rem, assumenda quasi voluptatibus, sit sapiente possimus tenetur consequuntur explicabo magni temporibus voluptates voluptate! Unde optio, necessitatibus, ut id iste, cumque cupiditate obcaecati dolores sapiente saepe voluptatem eaque.</p>
          <p>Omnis nesciunt tempore distinctio illum inventore quas est qui architecto eum deleniti harum commodi error quia ut excepturi possimus corporis, molestiae voluptatum! Excepturi autem asperiores explicabo repudiandae recusandae deleniti, commodi ipsa, iusto veritatis cumque fuga. Explicabo dolores nihil totam quisquam?</p>
          <p>Maiores voluptatum tempore, mollitia doloribus quibusdam numquam autem repellendus sequi, provident illum harum non accusamus modi, consequuntur error ad. Optio corporis cumque dolorem aspernatur consectetur rem ut sit voluptatem velit sequi nam vitae nostrum ducimus porro, incidunt explicabo maiores dolore!</p>
          <p>Corrupti dolor sapiente ipsa eos, consequatur vitae nemo sunt ad aperiam animi nostrum saepe eaque nulla magnam, est veniam sequi delectus temporibus itaque illo repellendus. Harum reiciendis dolorum quidem perferendis magnam totam labore, sed soluta dignissimos itaque similique repellat commodi?</p>
          <p>Dignissimos cum eum eligendi repellat, vel sequi? Fuga vero rem corporis. Magni ex fugiat a impedit delectus praesentium architecto culpa ratione veritatis, sunt, fuga quas et excepturi, perferendis odit. Exercitationem officiis adipisci alias sit iure fuga eius eligendi, corporis totam!</p>
          <p>Unde at laborum fuga odit, expedita accusantium ab placeat reiciendis voluptas quae quis dignissimos ullam, deserunt nisi numquam est nihil velit voluptatum explicabo tempora voluptatem. Autem, atque. Consequuntur dignissimos dolore ipsa quis, reiciendis ad voluptates velit quod perferendis placeat tenetur.</p>
          <p>Tempore dolores totam sapiente dolorum eius corrupti aliquam, pariatur architecto natus, necessitatibus repellendus voluptas voluptate. Incidunt quam voluptatum odio quaerat libero ex porro est sunt ipsa id aperiam, ut quo consectetur delectus ullam illum error excepturi quis sequi cum fugiat.</p>
          <p>Dolor architecto error ut et, fugit culpa facere officiis natus! Accusantium, dicta ipsam quidem nemo reprehenderit quibusdam repellendus dolorem sapiente ad quasi, tenetur quas incidunt placeat expedita dolore obcaecati in aperiam quam vel accusamus natus cumque asperiores veritatis. Corrupti, accusamus.</p>
          <p>Alias eaque adipisci quos laboriosam debitis sint dolorem commodi officia consectetur unde repellat sapiente esse officiis in quae odio hic ad obcaecati libero, earum dolore et veniam vitae? Aliquid molestiae corporis assumenda a error debitis animi velit deleniti distinctio commodi!</p>
          <p>Neque suscipit unde libero accusamus nam quod, magni non eos reiciendis dolore molestias, tenetur dolorum saepe ducimus expedita soluta cupiditate voluptatem nostrum nemo repellendus minima cumque iure fuga. Quis, autem aperiam? Sapiente saepe obcaecati maxime nobis debitis ipsum temporibus reprehenderit?</p>
          <p>Et totam, ipsum qui libero tenetur error iusto quibusdam blanditiis, aliquid beatae laudantium corporis officiis ducimus sit omnis assumenda eveniet dolorem dignissimos cumque? Necessitatibus commodi nihil maiores. Omnis sit ipsa ea quia totam numquam recusandae voluptate eaque. Cum, hic amet.</p>
          <p>Dicta qui esse tempora saepe dolor, suscipit quae iste fugiat earum deserunt quo eveniet incidunt enim. Eaque blanditiis nisi harum laborum cupiditate illo eius architecto nulla eligendi iure porro, quasi qui veniam. Cum quidem eos laudantium, id quis quia eaque?</p>
          <p>Id accusamus reiciendis blanditiis iure nulla, commodi quia ad qui cum atque, beatae voluptas delectus fugit vel accusantium sed corrupti suscipit illum. Impedit nemo numquam asperiores ut provident perspiciatis enim modi praesentium labore quod at et, minima quam soluta aliquam.</p>
          <p>Ut quae praesentium ratione omnis voluptatum, repellendus aperiam nesciunt perferendis fugiat, aliquam repellat ipsa, temporibus ducimus cum perspiciatis dolor. Sapiente placeat perspiciatis ducimus consequuntur numquam tempore quaerat quod repellendus. Explicabo qui, modi soluta ipsum praesentium minima eligendi doloremque ut aspernatur!</p>
          <p>Fugit asperiores provident atque obcaecati repudiandae magni cupiditate, repellat exercitationem quidem fugiat deserunt unde mollitia ratione. Quam accusamus laboriosam, possimus voluptates dignissimos, cumque odio laborum temporibus nisi amet est fugit odit dolorem, facilis debitis voluptatum? Similique unde quidem quibusdam a.</p>
          <p>Explicabo ratione nisi velit aliquam perspiciatis id nemo accusantium inventore sint officiis! Nesciunt recusandae harum, officia aperiam consequatur aut ipsam velit porro error ad quia magni, perspiciatis natus. Autem dignissimos tenetur sed eaque repellendus velit incidunt fuga qui quaerat pariatur.</p>
          <p>Mollitia laborum sequi aliquam dolor tempore ipsa? Veritatis earum impedit aut accusantium eum, sed cupiditate similique blanditiis vel quia doloremque, necessitatibus praesentium temporibus ullam ipsum fugiat iure modi nemo perspiciatis molestiae nam ad reprehenderit voluptatem hic! Facere delectus nulla voluptas!</p>
          <p>Obcaecati iusto tempora dignissimos nihil voluptatum sit rem mollitia, soluta unde error repellat debitis ab necessitatibus maiores harum iure vel quidem, dolores recusandae accusantium, magnam dolor similique fuga. Ipsum eligendi sit fugit consectetur blanditiis libero repellendus mollitia incidunt. Quisquam, molestias.</p>
          <p>Sed harum cupiditate doloremque quisquam mollitia eos debitis officia reprehenderit blanditiis sequi nisi necessitatibus ipsum laboriosam vero porro itaque, ratione tempora veritatis temporibus! Labore, cumque? Laudantium laborum ipsum, eaque molestias laboriosam quisquam animi reiciendis. Iusto mollitia dolor fugiat commodi alias.</p>
          <p>Obcaecati ipsum recusandae quam sequi perferendis molestiae voluptates dolorem magni tempore, eligendi sit, ut, ea a maxime animi non facere vero necessitatibus quaerat voluptatem laborum aliquam quis. Minus molestiae dolorem cum sapiente. Animi voluptatibus sit quaerat alias facilis ipsa molestias.</p>

        </div>
      </section>
    </>
   );
}
