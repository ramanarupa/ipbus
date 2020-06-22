import { Listener, ListListeners, SimpleListener } from '../src';

describe('ListListeners', () => {

  it('create ListListeners', () => {
    const ll = new ListListeners();
    expect(ll).not.toBeNull();
  })

  it('add listener', () => {
    const ll = new ListListeners();
    ll.add( new SimpleListener() );
    ll.add( new SimpleListener() );

    expect(ll).not.toBeNull();
    expect(ll.size()).toEqual(2);
  })

  it('concat listeners', () => {
    const l1 = new ListListeners();
    l1.add( new SimpleListener() );
    l1.add( new SimpleListener() );

    const l2 = new ListListeners();
    l2.add( new SimpleListener() );
    l2.add( new SimpleListener() );

    l1.concat(l2);

    expect(l1.size()).toEqual(4);
    expect(l2.size()).toEqual(2);
  })

  it('remove listener', () => {
    const ll = new ListListeners();
    ll.add( new SimpleListener( undefined, 'prefix1') );
    const listener = new SimpleListener();
    ll.add( listener );
    ll.add( new SimpleListener(undefined, 'prefix2') );

    expect(ll.size()).toEqual(3);
    ll.add( listener );
    expect(ll.size()).toEqual(3);
    ll.remove(listener);
    expect(ll.size()).toEqual(2);
    expect((ll.at(0) as SimpleListener).originId).toMatch(/^prefix1-/);
    expect((ll.at(1) as SimpleListener).originId).toMatch(/^prefix2-/);
    ll.remove(listener);
    expect(ll.size()).toEqual(2);
  })

  it('for each listener', () => {
    const ll = new ListListeners();
    ll.add( new SimpleListener( undefined, 'prefix0') );
    ll.add( new SimpleListener(undefined, 'prefix1') );
    ll.add( new SimpleListener(undefined, 'prefix2') );
    ll.each( (listener: SimpleListener, index?: number) => {
      expect(listener.originId.startsWith(`prefix${index}-`)).toBeTruthy();
    })
  })

  it('call any listener', () => {
    const ll = new ListListeners();
    ll.add( new SimpleListener( () => {
      return false;
    }, 'prefix0') );
    ll.add( new SimpleListener(() => {
      return true;
    }, 'prefix1') );
    ll.add( new SimpleListener(() => {
      return false;
    }, 'prefix2') );

    const res = ll.any( (listener: Listener): boolean => {
      const res: boolean = listener.process( {channel: '/'} );
      if( res ) {
        expect((listener as SimpleListener).originId.startsWith('prefix1')).toBeTruthy();
      }
      return res;
    });

    expect(res).toBeTruthy();
  })

})
