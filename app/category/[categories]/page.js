"use client";
import { useParams } from "next/navigation";
import Category from "./Category";

const Cate = () => {
  const params = useParams();
  const slugParam = params?.categories;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  return (
    <div>
      <Category slug={slug} />
    </div>
  );
};

export default Cate;
