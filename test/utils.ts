
export const mockDate = (date: string) => {
  const md = new Date(date);
  // @ts-ignore
  return jest.spyOn(global, 'Date').mockImplementation( () => md);
}