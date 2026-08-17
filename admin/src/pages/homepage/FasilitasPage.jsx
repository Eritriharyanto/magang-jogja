import SimpleListEditor from "@/components/SimpleListEditor";
import { getFasilitasList, createFasilitas, updateFasilitas, deleteFasilitas } from "@/api/homepageApi";

function FasilitasPage() {
  return (
    <SimpleListEditor
      title="Fasilitas"
      description="Poin-poin yang tampil di section 'Fasilitas yang didapat'."
      itemLabel="Fasilitas"
      api={{
        list: getFasilitasList,
        create: createFasilitas,
        update: updateFasilitas,
        delete: deleteFasilitas,
      }}
    />
  );
}

export default FasilitasPage;
