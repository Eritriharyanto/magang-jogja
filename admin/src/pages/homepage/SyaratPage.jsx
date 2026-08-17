import SimpleListEditor from "@/components/SimpleListEditor";
import { getSyaratList, createSyarat, updateSyarat, deleteSyarat } from "@/api/homepageApi";

function SyaratPage() {
  return (
    <SimpleListEditor
      title="Syarat & Ketentuan"
      description="Poin-poin yang tampil di section 'Syarat dan Ketentuan'."
      itemLabel="Syarat"
      api={{
        list: getSyaratList,
        create: createSyarat,
        update: updateSyarat,
        delete: deleteSyarat,
      }}
    />
  );
}

export default SyaratPage;
