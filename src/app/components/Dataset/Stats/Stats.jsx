import s from "./Stats.module.css";

export default function StatsTable({ info }) {
  const {
    name,
    number_of_languages,
    bitexts,
    number_of_files,
    total_number_of_tokens,
    total_sentence_fragments,
  } = info ?? {};

  const empty =
    !name &&
    !number_of_languages &&
    !bitexts &&
    !number_of_files &&
    !total_number_of_tokens &&
    !total_sentence_fragments;

  if (empty) return null;

  return (
    <section className={s.wrap}>
      <h2 className={s.title}>{name}&apos;s Numbers</h2>

      <div className={s.scroller}>
        <table className={s.table}>
          <thead className={s.head}>
            <tr>
              <th>Languages</th>
              <th>Bitexts</th>
              <th className={s.hideSm}>Files</th>
              <th className={s.hideSm}>Tokens</th>
              <th className={s.hideSm}>Sentence fragments</th>
            </tr>
          </thead>

          <tbody className={s.body}>
            <tr>
              <td>{number_of_languages}</td>
              <td>{bitexts}</td>
              <td className={s.hideSm}>{number_of_files}</td>
              <td className={s.hideSm}>{total_number_of_tokens}</td>
              <td className={s.hideSm}>{total_sentence_fragments}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
